-- Migration: 20260104004000_fix_jury_tie_breaker.sql
-- Purpose: Formalize "Status Quo Bias" for split jury decisions and add auditability

-- 1. Add vote_snapshot column for auditability
ALTER TABLE jury_deliberations
ADD COLUMN vote_snapshot JSONB;

-- 2. Update the vote counting function to handle split decisions explicitly
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
  v_snapshot JSONB;
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
  
  -- Check if we can conclude (Total votes reached required count)
  IF v_total >= v_required THEN
  
    -- Calculate percentages (excluding abstentions from denominator if needed, 
    -- but usually threshold is based on total cast votes. 
    -- Logic: Uphold/Total vs Overturn/Total)
    
    -- Determine decision
    IF v_uphold::DECIMAL / v_total >= v_threshold THEN
      v_decision := 'uphold';
    ELSIF v_overturn::DECIMAL / v_total >= v_threshold THEN
      v_decision := 'overturn';
    ELSE
      v_decision := 'split';
    END IF;
    
    -- Create snapshot
    v_snapshot := jsonb_build_object(
      'uphold', v_uphold,
      'overturn', v_overturn,
      'abstain', v_abstain,
      'total', v_total,
      'threshold', v_threshold
    );

    -- Conclude the deliberation
    UPDATE jury_deliberations
    SET 
      status = 'concluded',
      final_decision = v_decision,
      vote_snapshot = v_snapshot,
      concluded_at = NOW(),
      -- Add explanatory note if split
      decision_reasoning = CASE 
        WHEN v_decision = 'split' THEN 
          COALESCE(decision_reasoning, '') || E'\n\n[SYSTEM] Concluded as Split Decision. Status Quo Bias applied: Appeal Rejected.'
        ELSE decision_reasoning 
      END
    WHERE id = NEW.deliberation_id;
    
    -- Apply Consequences
    IF v_decision = 'overturn' THEN
      -- Success: Restore the content
      UPDATE moderation_appeals
      SET status = 'approved'
      WHERE id = v_deliberation.appeal_id;
      
      UPDATE posts
      SET approval_status = 'pending' -- Needs re-review or direct approval? Usually pending allows mods to check again or auto-approve.
      WHERE id = (SELECT post_id FROM moderation_appeals WHERE id = v_deliberation.appeal_id);
      
    ELSE
      -- Failure (Uphold OR Split): Maintain the flag
      UPDATE moderation_appeals
      SET status = 'rejected'
      WHERE id = v_deliberation.appeal_id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Notify schema cache reload
NOTIFY pgrst, 'reload schema';
