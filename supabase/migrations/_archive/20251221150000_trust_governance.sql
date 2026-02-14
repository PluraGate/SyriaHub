-- ============================================
-- TRUST GOVERNANCE SYSTEM
-- Migration: 20251221150000_trust_governance.sql
-- Purpose: Controlled growth with legible, accountable governance
-- ============================================

-- ============================================
-- PART 1: ENUMS
-- ============================================

CREATE TYPE invite_credit_event_type AS ENUM (
  'post_published',
  'peer_review_completed',
  'content_cited',
  'content_forked',
  'admin_grant',
  'decay',
  'used'
);

CREATE TYPE promotion_status AS ENUM (
  'pending', 'approved', 'rejected', 'withdrawn'
);

CREATE TYPE join_method AS ENUM (
  'invite_code',  -- Normal invite flow
  'seeded',       -- Initial seeder (generation 0)
  'imported',     -- Data migration (generation 0)
  'admin_created' -- Manual admin creation (generation 0)
);

CREATE TYPE trust_recalc_reason AS ENUM (
  'citation_received',
  'peer_review_rated',
  'content_forked',
  'penalty_updated',
  'manual_trigger'
);


-- ============================================
-- PART 2: INVITE TREE (Genealogical Tracking)
-- ============================================

CREATE TABLE invite_tree (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,  -- NULL for seeded/imported
  generation INT NOT NULL,
  invited_role TEXT NOT NULL,
  join_method join_method NOT NULL DEFAULT 'invite_code',
  seeding_conversation_held BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON COLUMN invite_tree.generation IS 
  'Genealogical depth: 0 for seeded/imported/admin_created, increments from inviter.';

CREATE INDEX idx_invite_tree_invited_by ON invite_tree(invited_by);
CREATE INDEX idx_invite_tree_generation ON invite_tree(generation);

-- Auto-create invite_tree entry on user creation
CREATE OR REPLACE FUNCTION create_invite_tree_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_inviter_gen INT;
BEGIN
  -- Check if user has invite info
  IF NEW.invited_by IS NOT NULL THEN
    SELECT generation INTO v_inviter_gen FROM invite_tree WHERE user_id = NEW.invited_by;
    INSERT INTO invite_tree (user_id, invited_by, generation, invited_role, join_method)
    VALUES (NEW.id, NEW.invited_by, COALESCE(v_inviter_gen, 0) + 1, NEW.role, 'invite_code')
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    -- Non-invite join: generation 0
    INSERT INTO invite_tree (user_id, invited_by, generation, invited_role, join_method)
    VALUES (NEW.id, NULL, 0, NEW.role, 'admin_created')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_invite_tree
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_invite_tree_entry();


-- ============================================
-- PART 3: INVITE CREDITS
-- ============================================

CREATE TABLE invite_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  credits_available INT DEFAULT 0 CHECK (credits_available >= 0),
  credits_earned_total INT DEFAULT 0,
  credits_used_total INT DEFAULT 0,
  last_decay_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE invite_credit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type invite_credit_event_type NOT NULL,
  credits_delta INT NOT NULL,
  reference_id UUID,
  -- Audit metadata (NOT the active decay mechanism)
  expires_at TIMESTAMPTZ,
  decay_policy_version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON COLUMN invite_credit_events.expires_at IS 
  'Policy snapshot for audit trail. Active decay handled by scheduled job.';

CREATE INDEX idx_invite_credit_events_user ON invite_credit_events(user_id);
CREATE INDEX idx_invite_credit_events_type ON invite_credit_events(event_type);

-- Auto-create credits row on user creation
CREATE OR REPLACE FUNCTION create_invite_credits_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO invite_credits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_invite_credits
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_invite_credits_entry();


-- ============================================
-- PART 4: PROMOTION WORKFLOW
-- ============================================

CREATE TABLE promotion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL CHECK (target_role IN ('researcher', 'moderator', 'admin')),
  from_role TEXT NOT NULL,
  status promotion_status DEFAULT 'pending',
  required_moderator_endorsements INT DEFAULT 3,
  required_admin_endorsements INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_promotion_requests_user ON promotion_requests(user_id);
CREATE INDEX idx_promotion_requests_status ON promotion_requests(status);

CREATE TABLE promotion_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES promotion_requests(id) ON DELETE CASCADE,
  endorser_id UUID REFERENCES users(id) ON DELETE SET NULL,
  endorser_role TEXT NOT NULL,
  justification TEXT NOT NULL CHECK (length(justification) >= 20),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_promotion_endorsements_request ON promotion_endorsements(request_id);

-- Self-endorsement prevention via TRIGGER
CREATE OR REPLACE FUNCTION prevent_self_endorsement()
RETURNS TRIGGER AS $$
DECLARE
  v_target_user UUID;
BEGIN
  SELECT user_id INTO v_target_user FROM promotion_requests WHERE id = NEW.request_id;
  
  IF NEW.endorser_id = v_target_user THEN
    RAISE EXCEPTION 'Cannot endorse your own promotion request';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_self_endorsement
  BEFORE INSERT ON promotion_endorsements
  FOR EACH ROW EXECUTE FUNCTION prevent_self_endorsement();


-- ============================================
-- PART 5: TRUST SCORE COMPONENTS
-- ============================================

CREATE TABLE trust_score_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Active components (weighted)
  citation_quality_score DECIMAL DEFAULT 0,      -- Weight: 2.0
  peer_review_helpfulness DECIMAL DEFAULT 0,    -- Weight: 2.5
  research_reuse_score DECIMAL DEFAULT 0,       -- Weight: 1.5
  cross_discipline_engagement DECIMAL DEFAULT 0, -- Weight: 1.0
  self_citation_penalty DECIMAL DEFAULT 0,      -- Weight: -3.0
  echo_chamber_penalty DECIMAL DEFAULT 0,       -- Weight: -2.0
  
  -- V2 PLACEHOLDERS (not yet weighted)
  low_effort_penalty DECIMAL DEFAULT 0,
  invite_subtree_citation_ratio DECIMAL DEFAULT 0,
  
  composite_trust_score DECIMAL DEFAULT 0,
  last_recalculated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON COLUMN trust_score_components.low_effort_penalty IS 
  'V2: Not yet included in composite score calculation.';
COMMENT ON COLUMN trust_score_components.invite_subtree_citation_ratio IS 
  'V2: Cross-citation within invite subtree analysis placeholder.';

CREATE INDEX idx_trust_score_user ON trust_score_components(user_id);
CREATE INDEX idx_trust_composite ON trust_score_components(composite_trust_score);

-- Auto-create trust score row on user creation
CREATE OR REPLACE FUNCTION create_trust_score_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO trust_score_components (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_trust_score
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_trust_score_entry();


-- ============================================
-- PART 6: TRUST RECALCULATION QUEUE
-- ============================================

CREATE TABLE trust_recalc_queue (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  queued_at TIMESTAMPTZ DEFAULT now(),
  reason trust_recalc_reason NOT NULL
);

CREATE INDEX idx_trust_queue_queued_at ON trust_recalc_queue(queued_at);

-- Lightweight trigger: enqueue only, don't compute
CREATE OR REPLACE FUNCTION enqueue_trust_recalc()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_reason trust_recalc_reason;
BEGIN
  -- Determine user and reason based on source table
  IF TG_TABLE_NAME = 'citations' THEN
    SELECT author_id INTO v_user_id FROM posts WHERE id = NEW.target_post_id;
    v_reason := 'citation_received';
  ELSIF TG_TABLE_NAME = 'peer_reviews' THEN
    SELECT author_id INTO v_user_id FROM posts WHERE id = NEW.post_id;
    v_reason := 'peer_review_rated';
  ELSIF TG_TABLE_NAME = 'posts' AND NEW.forked_from IS NOT NULL THEN
    v_user_id := (NEW.forked_from->>'author_id')::UUID;
    v_reason := 'content_forked';
  END IF;
  
  -- NULL guard: skip if no valid user
  IF v_user_id IS NULL THEN 
    RETURN NEW; 
  END IF;
  
  -- Dedupe insert (user_id is PK)
  INSERT INTO trust_recalc_queue (user_id, reason)
  VALUES (v_user_id, v_reason)
  ON CONFLICT (user_id) DO UPDATE SET 
    queued_at = GREATEST(trust_recalc_queue.queued_at, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_queue_trust_on_citation
  AFTER INSERT ON citations
  FOR EACH ROW EXECUTE FUNCTION enqueue_trust_recalc();


-- ============================================
-- PART 7: TRUST SCORE CALCULATION
-- ============================================

CREATE OR REPLACE FUNCTION recalculate_trust_score(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_citation_quality DECIMAL := 0;
  v_peer_review DECIMAL := 0;
  v_reuse DECIMAL := 0;
  v_cross_discipline DECIMAL := 0;
  v_self_citation DECIMAL := 0;
  v_echo_chamber DECIMAL := 0;
  v_composite DECIMAL;
BEGIN
  -- Citation quality: weighted by citing post's own citations
  SELECT COALESCE(AVG(
    CASE WHEN citing.academic_impact_score > 0 
         THEN LEAST(citing.academic_impact_score, 10) 
         ELSE 1 END
  ), 0) INTO v_citation_quality
  FROM citations c
  JOIN posts cited ON c.target_post_id = cited.id
  JOIN posts citing ON c.source_post_id = citing.id
  WHERE cited.author_id = p_user_id;
  
  -- Peer review helpfulness (from peer_reviews if rated)
  SELECT COALESCE(AVG(overall_score), 0) INTO v_peer_review
  FROM peer_reviews
  WHERE reviewer_id = p_user_id AND status = 'completed';
  
  -- Research reuse (forks by others)
  SELECT COUNT(*)::DECIMAL INTO v_reuse
  FROM posts p
  WHERE p.forked_from IS NOT NULL
  AND (p.forked_from->>'author_id')::UUID = p_user_id
  AND p.author_id != p_user_id;
  
  -- Self-citation penalty
  SELECT COUNT(*)::DECIMAL INTO v_self_citation
  FROM citations c
  JOIN posts source ON c.source_post_id = source.id
  JOIN posts target ON c.target_post_id = target.id
  WHERE source.author_id = p_user_id AND target.author_id = p_user_id;
  
  -- Composite calculation (weights aligned with docs)
  v_composite := 
    (v_citation_quality * 2.0) +
    (v_peer_review * 2.5) +
    (LEAST(v_reuse, 10) * 1.5) +
    (v_cross_discipline * 1.0) -
    (LEAST(v_self_citation, 5) * 3.0) -
    (v_echo_chamber * 2.0);
  
  -- Store result
  INSERT INTO trust_score_components (
    user_id, citation_quality_score, peer_review_helpfulness,
    research_reuse_score, cross_discipline_engagement,
    self_citation_penalty, echo_chamber_penalty,
    composite_trust_score, last_recalculated_at
  ) VALUES (
    p_user_id, v_citation_quality, v_peer_review,
    v_reuse, v_cross_discipline,
    v_self_citation, v_echo_chamber,
    v_composite, NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    citation_quality_score = EXCLUDED.citation_quality_score,
    peer_review_helpfulness = EXCLUDED.peer_review_helpfulness,
    research_reuse_score = EXCLUDED.research_reuse_score,
    cross_discipline_engagement = EXCLUDED.cross_discipline_engagement,
    self_citation_penalty = EXCLUDED.self_citation_penalty,
    echo_chamber_penalty = EXCLUDED.echo_chamber_penalty,
    composite_trust_score = EXCLUDED.composite_trust_score,
    last_recalculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Batch processor (called by scheduled job)
CREATE OR REPLACE FUNCTION process_trust_recalc_queue(p_limit INT DEFAULT 100)
RETURNS INT AS $$
DECLARE
  v_processed INT := 0;
  v_user_id UUID;
BEGIN
  FOR v_user_id IN 
    SELECT user_id FROM trust_recalc_queue
    ORDER BY queued_at  -- FIFO to avoid starvation
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  LOOP
    PERFORM recalculate_trust_score(v_user_id);
    DELETE FROM trust_recalc_queue WHERE user_id = v_user_id;
    v_processed := v_processed + 1;
  END LOOP;
  
  RETURN v_processed;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- PART 8: DIVERSITY METRICS
-- ============================================

CREATE TABLE invite_diversity_metrics (
  inviter_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  disciplines_invited TEXT[] DEFAULT '{}',
  institutions_invited TEXT[] DEFAULT '{}',
  geographies_invited TEXT[] DEFAULT '{}',
  
  discipline_homogeneity DECIMAL DEFAULT 0 CHECK (discipline_homogeneity BETWEEN 0 AND 100),
  institution_homogeneity DECIMAL DEFAULT 0 CHECK (institution_homogeneity BETWEEN 0 AND 100),
  geography_homogeneity DECIMAL DEFAULT 0 CHECK (geography_homogeneity BETWEEN 0 AND 100),
  
  warning_count INT DEFAULT 0,
  invite_blocked BOOLEAN DEFAULT false,
  block_reason TEXT,
  appeal_submitted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON COLUMN invite_diversity_metrics.invite_blocked IS 
  'Blocks invite creation ONLY. Reading, posting, commenting unaffected.';

-- Auto-create diversity metrics row on user creation
CREATE OR REPLACE FUNCTION create_diversity_metrics_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO invite_diversity_metrics (inviter_id)
  VALUES (NEW.id)
  ON CONFLICT (inviter_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_diversity_metrics
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_diversity_metrics_entry();

-- Check if user can create invites
CREATE OR REPLACE FUNCTION check_invite_allowed(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_blocked BOOLEAN;
  v_reason TEXT;
BEGIN
  SELECT invite_blocked, block_reason INTO v_blocked, v_reason
  FROM invite_diversity_metrics WHERE inviter_id = p_user_id;
  
  -- No row = allowed (auto-create should have made one, but be safe)
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', true);
  END IF;
  
  IF v_blocked THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', v_reason,
      'appeal_path', '/settings/appeals'
    );
  END IF;
  
  RETURN jsonb_build_object('allowed', true);
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- PART 9: CLUSTER DETECTION
-- ============================================

CREATE OR REPLACE FUNCTION detect_endorsement_cluster(p_request_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_endorsers UUID[];
  v_request_generation INT;
  v_max_shared_count INT := 0;
  v_total_endorsers INT;
  v_is_cluster BOOLEAN := false;
  v_threshold DECIMAL;
BEGIN
  -- Get all endorsers for this request
  SELECT ARRAY_AGG(endorser_id) INTO v_endorsers
  FROM promotion_endorsements WHERE request_id = p_request_id;
  
  v_total_endorsers := COALESCE(array_length(v_endorsers, 1), 0);
  IF v_total_endorsers < 2 THEN
    RETURN jsonb_build_object('is_cluster', false, 'reason', 'insufficient_endorsers');
  END IF;
  
  -- Get generation of request target for threshold adjustment
  SELECT generation INTO v_request_generation
  FROM invite_tree WHERE user_id = (
    SELECT user_id FROM promotion_requests WHERE id = p_request_id
  );
  
  -- Find max group size sharing same inviter (excluding NULL invited_by)
  SELECT COALESCE(MAX(cnt), 0) INTO v_max_shared_count
  FROM (
    SELECT invited_by, COUNT(*) as cnt
    FROM invite_tree 
    WHERE user_id = ANY(v_endorsers) 
    AND invited_by IS NOT NULL  -- Exclude non-invite joins
    GROUP BY invited_by
  ) grouped;
  
  -- Generation-aware threshold (relaxed for early seeding)
  v_threshold := CASE 
    WHEN v_request_generation IS NULL THEN 0.5
    WHEN v_request_generation <= 2 THEN 0.7  -- 70% for early generations
    ELSE 0.5  -- 50% for mature network
  END;
  
  -- Cluster = max shared group / total > threshold
  v_is_cluster := (v_max_shared_count::DECIMAL / v_total_endorsers) > v_threshold;
  
  RETURN jsonb_build_object(
    'is_cluster', v_is_cluster,
    'endorser_count', v_total_endorsers,
    'max_shared_inviter_group', v_max_shared_count,
    'generation', v_request_generation,
    'threshold_used', v_threshold
  );
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- PART 10: INVITE CREDIT MANAGEMENT
-- ============================================

CREATE OR REPLACE FUNCTION earn_invite_credit(
  p_user_id UUID,
  p_event_type invite_credit_event_type,
  p_credits INT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Log the event
  INSERT INTO invite_credit_events (user_id, event_type, credits_delta, reference_id)
  VALUES (p_user_id, p_event_type, p_credits, p_reference_id);
  
  -- Update balance
  UPDATE invite_credits
  SET credits_available = credits_available + p_credits,
      credits_earned_total = credits_earned_total + p_credits
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION use_invite_credit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_available INT;
BEGIN
  SELECT credits_available INTO v_available 
  FROM invite_credits WHERE user_id = p_user_id FOR UPDATE;
  
  IF v_available IS NULL OR v_available < 1 THEN
    RETURN false;
  END IF;
  
  -- Log usage
  INSERT INTO invite_credit_events (user_id, event_type, credits_delta)
  VALUES (p_user_id, 'used', -1);
  
  -- Deduct
  UPDATE invite_credits
  SET credits_available = credits_available - 1,
      credits_used_total = credits_used_total + 1
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Credit decay (batch processor)
CREATE OR REPLACE FUNCTION decay_invite_credits(
  p_inactive_days INT DEFAULT 90,
  p_decay_percent DECIMAL DEFAULT 0.1
)
RETURNS INT AS $$
DECLARE
  v_decayed INT := 0;
  v_record RECORD;
  v_decay_amount INT;
BEGIN
  FOR v_record IN 
    SELECT user_id, credits_available
    FROM invite_credits
    WHERE credits_available > 0
    AND (last_decay_at IS NULL OR last_decay_at < NOW() - (p_inactive_days || ' days')::INTERVAL)
    FOR UPDATE SKIP LOCKED
  LOOP
    v_decay_amount := GREATEST(1, FLOOR(v_record.credits_available * p_decay_percent));
    
    INSERT INTO invite_credit_events (user_id, event_type, credits_delta, decay_policy_version)
    VALUES (v_record.user_id, 'decay', -v_decay_amount, 1);
    
    UPDATE invite_credits
    SET credits_available = credits_available - v_decay_amount,
        last_decay_at = NOW()
    WHERE user_id = v_record.user_id;
    
    v_decayed := v_decayed + 1;
  END LOOP;
  
  RETURN v_decayed;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- PART 11: RLS POLICIES
-- ============================================

ALTER TABLE invite_tree ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_credit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_score_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_recalc_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_diversity_metrics ENABLE ROW LEVEL SECURITY;

-- Invite tree: public read
CREATE POLICY "Anyone can view invite tree" ON invite_tree FOR SELECT USING (true);

-- Credits: user sees own
CREATE POLICY "Users see own credits" ON invite_credits 
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users see own credit events" ON invite_credit_events
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Admins see all credits
CREATE POLICY "Admins see all credits" ON invite_credits
  FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Promotion requests: user sees own, mods/admins see all
CREATE POLICY "Users see own promotion requests" ON promotion_requests
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Mods see all promotion requests" ON promotion_requests
  FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('moderator', 'admin')));

CREATE POLICY "Users create own promotion request" ON promotion_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Endorsements: authenticated can view
CREATE POLICY "Authenticated view endorsements" ON promotion_endorsements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Mods/admins create endorsements" ON promotion_endorsements
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('moderator', 'admin')));

-- Trust scores: public read
CREATE POLICY "Anyone can view trust scores" ON trust_score_components FOR SELECT USING (true);

-- Diversity metrics: user sees own
CREATE POLICY "Users see own diversity" ON invite_diversity_metrics
  FOR SELECT TO authenticated USING (inviter_id = auth.uid());


-- ============================================
-- PART 12: GRANTS
-- ============================================

GRANT EXECUTE ON FUNCTION check_invite_allowed TO authenticated;
GRANT EXECUTE ON FUNCTION detect_endorsement_cluster TO authenticated;
GRANT EXECUTE ON FUNCTION earn_invite_credit TO authenticated;
GRANT EXECUTE ON FUNCTION use_invite_credit TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_trust_score TO authenticated;
GRANT EXECUTE ON FUNCTION process_trust_recalc_queue TO authenticated;
GRANT EXECUTE ON FUNCTION decay_invite_credits TO authenticated;

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
