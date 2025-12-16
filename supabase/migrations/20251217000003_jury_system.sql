-- Jury Review System for Decentralized Appeals
-- Migration: 20251217000003_jury_system.sql
-- Purpose: Prevent single-admin decision making on appeals

-- ============================================
-- MODIFY EXISTING APPEALS TABLE
-- ============================================

-- Add jury-related status to moderation_appeals
ALTER TABLE moderation_appeals 
  DROP CONSTRAINT IF EXISTS moderation_appeals_status_check;
  
ALTER TABLE moderation_appeals 
  ADD CONSTRAINT moderation_appeals_status_check 
  CHECK (status IN ('pending', 'under_jury_review', 'approved', 'rejected', 'revision_requested'));


-- ============================================
-- JURY DELIBERATIONS
-- ============================================

CREATE TABLE jury_deliberations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appeal_id UUID REFERENCES moderation_appeals(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Configuration
  required_votes INT DEFAULT 3 CHECK (required_votes >= 3),
  majority_threshold DECIMAL(3,2) DEFAULT 0.67, -- 2/3 majority
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'concluded', 'timed_out', 'cancelled')),
  
  -- Vote counts (updated by trigger)
  votes_uphold INT DEFAULT 0,
  votes_overturn INT DEFAULT 0,
  votes_abstain INT DEFAULT 0,
  total_votes INT DEFAULT 0,
  
  -- Decision
  final_decision TEXT CHECK (final_decision IN ('uphold', 'overturn', 'split', 'inconclusive')),
  decision_reasoning TEXT,
  
  -- Timing
  deadline TIMESTAMPTZ DEFAULT (now() + interval '72 hours'),
  created_at TIMESTAMPTZ DEFAULT now(),
  concluded_at TIMESTAMPTZ
);

CREATE INDEX idx_jury_deliberations_appeal ON jury_deliberations(appeal_id);
CREATE INDEX idx_jury_deliberations_status ON jury_deliberations(status);
CREATE INDEX idx_jury_deliberations_deadline ON jury_deliberations(deadline);


-- ============================================
-- JURY ASSIGNMENTS
-- ============================================

CREATE TABLE jury_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliberation_id UUID REFERENCES jury_deliberations(id) ON DELETE CASCADE NOT NULL,
  juror_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Status
  assigned_at TIMESTAMPTZ DEFAULT now(),
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,
  responded BOOLEAN DEFAULT false,
  responded_at TIMESTAMPTZ,
  
  -- Decline option
  declined BOOLEAN DEFAULT false,
  decline_reason TEXT,
  
  UNIQUE(deliberation_id, juror_id)
);

CREATE INDEX idx_jury_assignments_deliberation ON jury_assignments(deliberation_id);
CREATE INDEX idx_jury_assignments_juror ON jury_assignments(juror_id);
CREATE INDEX idx_jury_assignments_pending ON jury_assignments(responded) WHERE responded = false;


-- ============================================
-- JURY VOTES
-- ============================================

CREATE TABLE jury_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliberation_id UUID REFERENCES jury_deliberations(id) ON DELETE CASCADE NOT NULL,
  juror_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Vote
  vote TEXT NOT NULL CHECK (vote IN ('uphold', 'overturn', 'abstain')),
  reasoning TEXT NOT NULL, -- Required explanation
  
  -- Metadata
  is_anonymous BOOLEAN DEFAULT true, -- Hide identity until concluded
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(deliberation_id, juror_id)
);

CREATE INDEX idx_jury_votes_deliberation ON jury_votes(deliberation_id);
CREATE INDEX idx_jury_votes_juror ON jury_votes(juror_id);


-- ============================================
-- FUNCTIONS: Jury Selection
-- ============================================

-- Get eligible jurors for an appeal
CREATE OR REPLACE FUNCTION get_eligible_jurors(
  p_appeal_id UUID,
  p_exclude_user_id UUID DEFAULT NULL -- The post author
)
RETURNS TABLE(user_id UUID, name TEXT, role TEXT, reputation INT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.role,
    COALESCE(u.reputation, 0)::INT
  FROM users u
  WHERE u.role IN ('admin', 'moderator', 'researcher')
    AND u.id != COALESCE(p_exclude_user_id, '00000000-0000-0000-0000-000000000000'::UUID)
    -- Exclude the moderator who flagged the content
    AND u.id NOT IN (
      SELECT p.approved_by FROM posts p
      JOIN moderation_appeals ma ON ma.post_id = p.id
      WHERE ma.id = p_appeal_id
      AND p.approved_by IS NOT NULL
    )
    -- Exclude anyone who already voted on this appeal's deliberation
    AND u.id NOT IN (
      SELECT jv.juror_id FROM jury_votes jv
      JOIN jury_deliberations jd ON jd.id = jv.deliberation_id
      WHERE jd.appeal_id = p_appeal_id
    )
  ORDER BY 
    CASE u.role 
      WHEN 'admin' THEN 1 
      WHEN 'moderator' THEN 2 
      ELSE 3 
    END,
    COALESCE(u.reputation, 0) DESC
  LIMIT 10; -- Return top 10 candidates to pick from
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- FUNCTIONS: Vote Counting & Decision
-- ============================================

-- Update vote counts when a vote is cast
CREATE OR REPLACE FUNCTION update_jury_vote_counts()
RETURNS TRIGGER AS $$
DECLARE
  v_deliberation jury_deliberations;
  v_uphold INT;
  v_overturn INT;
  v_abstain INT;
  v_total INT;
  v_required INT;
  v_threshold DECIMAL;
  v_decision TEXT;
BEGIN
  -- Count votes
  SELECT 
    COUNT(*) FILTER (WHERE vote = 'uphold'),
    COUNT(*) FILTER (WHERE vote = 'overturn'),
    COUNT(*) FILTER (WHERE vote = 'abstain'),
    COUNT(*)
  INTO v_uphold, v_overturn, v_abstain, v_total
  FROM jury_votes
  WHERE deliberation_id = NEW.deliberation_id;
  
  -- Get deliberation config
  SELECT * INTO v_deliberation
  FROM jury_deliberations
  WHERE id = NEW.deliberation_id;
  
  v_required := v_deliberation.required_votes;
  v_threshold := v_deliberation.majority_threshold;
  
  -- Update counts
  UPDATE jury_deliberations
  SET 
    votes_uphold = v_uphold,
    votes_overturn = v_overturn,
    votes_abstain = v_abstain,
    total_votes = v_total
  WHERE id = NEW.deliberation_id;
  
  -- Mark assignment as responded
  UPDATE jury_assignments
  SET responded = true, responded_at = NOW()
  WHERE deliberation_id = NEW.deliberation_id AND juror_id = NEW.juror_id;
  
  -- Check if we can conclude
  IF v_total >= v_required THEN
    -- Determine decision
    IF v_uphold::DECIMAL / v_total >= v_threshold THEN
      v_decision := 'uphold';
    ELSIF v_overturn::DECIMAL / v_total >= v_threshold THEN
      v_decision := 'overturn';
    ELSE
      v_decision := 'split';
    END IF;
    
    -- Conclude the deliberation
    UPDATE jury_deliberations
    SET 
      status = 'concluded',
      final_decision = v_decision,
      concluded_at = NOW()
    WHERE id = NEW.deliberation_id;
    
    -- Update the appeal based on decision
    IF v_decision = 'overturn' THEN
      UPDATE moderation_appeals
      SET status = 'approved'
      WHERE id = v_deliberation.appeal_id;
      
      -- Restore the post
      UPDATE posts
      SET approval_status = 'pending'
      WHERE id = (SELECT post_id FROM moderation_appeals WHERE id = v_deliberation.appeal_id);
    ELSE
      UPDATE moderation_appeals
      SET status = 'rejected'
      WHERE id = v_deliberation.appeal_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_jury_vote_cast
  AFTER INSERT ON jury_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_jury_vote_counts();


-- Check for timed-out deliberations (to be called by cron)
CREATE OR REPLACE FUNCTION check_jury_timeouts()
RETURNS INT AS $$
DECLARE
  v_count INT := 0;
BEGIN
  UPDATE jury_deliberations
  SET 
    status = 'timed_out',
    concluded_at = NOW(),
    final_decision = 'inconclusive'
  WHERE status = 'active'
    AND deadline < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE jury_deliberations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jury_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jury_votes ENABLE ROW LEVEL SECURITY;

-- Deliberations: Public read (concluded), assigned jurors read (active)
CREATE POLICY "Public read concluded deliberations" ON jury_deliberations
  FOR SELECT USING (status = 'concluded');
  
CREATE POLICY "Assigned jurors read active deliberations" ON jury_deliberations
  FOR SELECT TO authenticated
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM jury_assignments ja
      WHERE ja.deliberation_id = jury_deliberations.id
      AND ja.juror_id = auth.uid()
    )
  );

CREATE POLICY "Admins read all deliberations" ON jury_deliberations
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins create deliberations" ON jury_deliberations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Assignments: Jurors see their own, admins see all
CREATE POLICY "Jurors see own assignments" ON jury_assignments
  FOR SELECT TO authenticated
  USING (juror_id = auth.uid());

CREATE POLICY "Admins see all assignments" ON jury_assignments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins create assignments" ON jury_assignments
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Votes: Anonymous until concluded, then public
CREATE POLICY "Public read concluded votes" ON jury_votes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jury_deliberations jd
      WHERE jd.id = jury_votes.deliberation_id
      AND jd.status = 'concluded'
    )
  );

CREATE POLICY "Jurors vote on assigned deliberations" ON jury_votes
  FOR INSERT TO authenticated
  WITH CHECK (
    juror_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM jury_assignments ja
      WHERE ja.deliberation_id = jury_votes.deliberation_id
      AND ja.juror_id = auth.uid()
      AND ja.declined = false
    )
  );


-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
