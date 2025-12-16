-- Peer Review Workflow
-- Migration: 20251217000004_peer_review.sql
-- Purpose: Structured expert review for content validation

-- ============================================
-- ADD REVIEW STATUS TO POSTS
-- ============================================

ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS review_status TEXT 
  DEFAULT 'not_requested' 
  CHECK (review_status IN (
    'not_requested',      -- Author hasn't requested review
    'pending_reviewers',  -- Waiting for reviewers to accept
    'under_review',       -- Active review in progress
    'peer_reviewed',      -- Successfully peer reviewed
    'needs_revision'      -- Reviewer requested changes
  ));

CREATE INDEX idx_posts_review_status ON posts(review_status);


-- ============================================
-- PEER REVIEW REQUESTS
-- ============================================

CREATE TABLE review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  
  -- Requester
  requested_by UUID REFERENCES users(id) NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT now(),
  
  -- Configuration
  min_reviewers INT DEFAULT 2,
  max_reviewers INT DEFAULT 5,
  review_type TEXT DEFAULT 'open' CHECK (review_type IN ('open', 'blind', 'double_blind')),
  
  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  
  -- Result (after reviews)
  consensus_recommendation TEXT,
  
  -- Notes
  request_notes TEXT
);

CREATE INDEX idx_review_requests_post ON review_requests(post_id);
CREATE INDEX idx_review_requests_status ON review_requests(status);


-- ============================================
-- PEER REVIEWS
-- ============================================

CREATE TABLE peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES review_requests(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Invited, not yet responded
    'accepted',     -- Reviewer accepted
    'in_progress',  -- Actively reviewing
    'completed',    -- Review submitted
    'declined'      -- Reviewer declined
  )),
  
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Review Criteria Scores (1-5)
  accuracy_score INT CHECK (accuracy_score BETWEEN 1 AND 5),
  methodology_score INT CHECK (methodology_score BETWEEN 1 AND 5),
  clarity_score INT CHECK (clarity_score BETWEEN 1 AND 5),
  relevance_score INT CHECK (relevance_score BETWEEN 1 AND 5),
  citations_score INT CHECK (citations_score BETWEEN 1 AND 5),
  
  -- Composite score (computed)
  overall_score DECIMAL(3,2),
  
  -- Recommendation
  recommendation TEXT CHECK (recommendation IN (
    'accept',           -- Publish as-is
    'minor_revision',   -- Small changes needed
    'major_revision',   -- Significant changes needed
    'reject'            -- Not suitable for publication
  )),
  
  -- Comments
  public_comments TEXT,   -- Visible to author and public after publish
  private_comments TEXT,  -- Only visible to author
  editor_comments TEXT,   -- Only visible to moderators/admins
  
  -- Confidence
  reviewer_confidence TEXT CHECK (reviewer_confidence IN ('low', 'medium', 'high')),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_peer_reviews_request ON peer_reviews(request_id);
CREATE INDEX idx_peer_reviews_post ON peer_reviews(post_id);
CREATE INDEX idx_peer_reviews_reviewer ON peer_reviews(reviewer_id);
CREATE INDEX idx_peer_reviews_status ON peer_reviews(status);


-- ============================================
-- EXPERT VERIFICATION
-- ============================================

CREATE TABLE expert_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- What they're verified for
  discipline discipline NOT NULL,
  expertise_level TEXT DEFAULT 'intermediate' CHECK (expertise_level IN ('beginner', 'intermediate', 'expert', 'authority')),
  
  -- Credentials
  credential_type TEXT NOT NULL CHECK (credential_type IN (
    'academic_degree',
    'professional_certification',
    'work_experience',
    'publication_record',
    'institutional_affiliation'
  )),
  credential_details TEXT NOT NULL,
  credential_year INT,
  institution TEXT,
  
  -- Proof
  document_url TEXT, -- Supabase storage URL
  document_verified BOOLEAN DEFAULT false,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  
  -- Review
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Validity
  valid_until TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_expert_verifications_user ON expert_verifications(user_id);
CREATE INDEX idx_expert_verifications_discipline ON expert_verifications(discipline);
CREATE INDEX idx_expert_verifications_status ON expert_verifications(status);

-- Add verified domains to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_disciplines discipline[] DEFAULT '{}';


-- ============================================
-- FUNCTIONS: Expert Matching
-- ============================================

-- Find reviewers matching post disciplines
CREATE OR REPLACE FUNCTION find_matching_reviewers(
  p_post_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE(
  user_id UUID,
  name TEXT,
  match_score INT,
  verified_disciplines discipline[]
) AS $$
BEGIN
  RETURN QUERY
  WITH post_disciplines AS (
    SELECT discipline FROM content_disciplines
    WHERE content_id = p_post_id AND content_type = 'post'
  ),
  post_author AS (
    SELECT author_id FROM posts WHERE id = p_post_id
  )
  SELECT 
    u.id,
    u.name,
    (
      -- Score based on matching verified disciplines
      COALESCE(array_length(
        ARRAY(
          SELECT unnest(u.verified_disciplines) 
          INTERSECT 
          SELECT discipline FROM post_disciplines
        ), 1
      ), 0) * 10 +
      -- Bonus for being a researcher/moderator
      CASE u.role WHEN 'researcher' THEN 5 WHEN 'moderator' THEN 7 WHEN 'admin' THEN 8 ELSE 0 END +
      -- Bonus for reputation
      LEAST(COALESCE(u.reputation, 0) / 100, 10)
    )::INT as match_score,
    u.verified_disciplines
  FROM users u
  WHERE u.id != (SELECT author_id FROM post_author)
    AND u.role IN ('researcher', 'moderator', 'admin')
    AND (
      -- At least one verified discipline matches
      u.verified_disciplines && ARRAY(SELECT discipline FROM post_disciplines)
      OR
      -- Or has posts in same disciplines
      EXISTS (
        SELECT 1 FROM content_disciplines cd
        JOIN posts p ON p.id = cd.content_id AND cd.content_type = 'post'
        WHERE p.author_id = u.id
        AND cd.discipline IN (SELECT discipline FROM post_disciplines)
      )
    )
  ORDER BY match_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


-- Calculate overall review score
CREATE OR REPLACE FUNCTION calculate_review_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.accuracy_score IS NOT NULL AND 
     NEW.methodology_score IS NOT NULL AND
     NEW.clarity_score IS NOT NULL AND
     NEW.relevance_score IS NOT NULL AND
     NEW.citations_score IS NOT NULL THEN
    NEW.overall_score := (
      NEW.accuracy_score + 
      NEW.methodology_score + 
      NEW.clarity_score + 
      NEW.relevance_score + 
      NEW.citations_score
    )::DECIMAL / 5;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_review_score
  BEFORE INSERT OR UPDATE ON peer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION calculate_review_score();


-- Update post review status based on reviews
CREATE OR REPLACE FUNCTION update_post_review_status()
RETURNS TRIGGER AS $$
DECLARE
  v_completed_count INT;
  v_min_reviewers INT;
  v_avg_recommendation TEXT;
BEGIN
  -- Only act on completed reviews
  IF NEW.status != 'completed' THEN
    RETURN NEW;
  END IF;
  
  -- Count completed reviews for this request
  SELECT COUNT(*) INTO v_completed_count
  FROM peer_reviews
  WHERE request_id = NEW.request_id AND status = 'completed';
  
  -- Get min reviewers required
  SELECT min_reviewers INTO v_min_reviewers
  FROM review_requests
  WHERE id = NEW.request_id;
  
  -- If we have enough reviews, determine consensus
  IF v_completed_count >= v_min_reviewers THEN
    -- Get most common recommendation
    SELECT recommendation INTO v_avg_recommendation
    FROM peer_reviews
    WHERE request_id = NEW.request_id AND status = 'completed'
    GROUP BY recommendation
    ORDER BY COUNT(*) DESC
    LIMIT 1;
    
    -- Update review request
    UPDATE review_requests
    SET 
      status = 'completed',
      completed_at = NOW(),
      consensus_recommendation = v_avg_recommendation
    WHERE id = NEW.request_id;
    
    -- Update post status
    UPDATE posts
    SET review_status = CASE 
      WHEN v_avg_recommendation = 'accept' THEN 'peer_reviewed'
      WHEN v_avg_recommendation IN ('minor_revision', 'major_revision') THEN 'needs_revision'
      ELSE 'not_requested'
    END
    WHERE id = NEW.post_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_review_status
  AFTER UPDATE ON peer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_post_review_status();


-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_verifications ENABLE ROW LEVEL SECURITY;

-- Review requests: author and admins
CREATE POLICY "Authors see own review requests" ON review_requests
  FOR SELECT TO authenticated
  USING (requested_by = auth.uid());

CREATE POLICY "Admins see all review requests" ON review_requests
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "Authors create review requests" ON review_requests
  FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid());

-- Peer reviews: reviewers see their own, public after post published
CREATE POLICY "Reviewers see own reviews" ON peer_reviews
  FOR SELECT TO authenticated
  USING (reviewer_id = auth.uid());

CREATE POLICY "Public see completed reviews on published posts" ON peer_reviews
  FOR SELECT
  USING (
    status = 'completed' AND
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = peer_reviews.post_id
      AND p.status = 'published'
    )
  );

CREATE POLICY "Reviewers submit reviews" ON peer_reviews
  FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

-- Expert verifications: user sees own, admins see all
CREATE POLICY "Users see own verifications" ON expert_verifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins see all verifications" ON expert_verifications
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users create verification requests" ON expert_verifications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins update verifications" ON expert_verifications
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
