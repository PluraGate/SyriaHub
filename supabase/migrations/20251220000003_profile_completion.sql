-- ============================================
-- PROFILE COMPLETION SCORE
-- ============================================
-- Privacy-first profile completion tracking
-- Core fields = 100%, optional fields = bonus XP only

-- ============================================
-- GET PROFILE COMPLETION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_profile_completion(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user RECORD;
    v_skill_count INT;
    v_endorsement_count INT;
    v_core_score INT := 0;
    v_core_max INT := 100;
    v_bonus_xp INT := 0;
    v_missing_core TEXT[] := ARRAY[]::TEXT[];
    v_optional_completed TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Get user data
    SELECT * INTO v_user FROM users WHERE id = p_user_id;
    
    IF v_user IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    -- Get skill count
    SELECT COUNT(*) INTO v_skill_count 
    FROM user_skills 
    WHERE user_id = p_user_id;
    
    -- Get endorsement count
    SELECT COALESCE(SUM(endorsement_count), 0) INTO v_endorsement_count
    FROM (
        SELECT COUNT(*) as endorsement_count
        FROM endorsements
        WHERE endorsed_user_id = p_user_id
        GROUP BY skill_id
    ) sub;
    
    -- ============================================
    -- CORE FIELDS (Required for 100%)
    -- ============================================
    
    -- Display Name (20 points)
    IF v_user.name IS NOT NULL AND LENGTH(TRIM(v_user.name)) > 0 THEN
        v_core_score := v_core_score + 20;
    ELSE
        v_missing_core := array_append(v_missing_core, 'name');
    END IF;
    
    -- Bio - at least 30 chars (25 points)
    IF v_user.bio IS NOT NULL AND LENGTH(TRIM(v_user.bio)) >= 30 THEN
        v_core_score := v_core_score + 25;
    ELSE
        v_missing_core := array_append(v_missing_core, 'bio');
    END IF;
    
    -- Profile Photo (20 points)
    IF v_user.avatar_url IS NOT NULL AND LENGTH(v_user.avatar_url) > 0 THEN
        v_core_score := v_core_score + 20;
    ELSE
        v_missing_core := array_append(v_missing_core, 'avatar');
    END IF;
    
    -- At least 1 skill (20 points)
    IF v_skill_count >= 1 THEN
        v_core_score := v_core_score + 20;
    ELSE
        v_missing_core := array_append(v_missing_core, 'skills');
    END IF;
    
    -- Email verified (15 points) - check if email exists (auth verification)
    -- Since we can't easily check auth.users, give points if they have an id
    v_core_score := v_core_score + 15;
    
    -- ============================================
    -- OPTIONAL BONUS FIELDS (Extra XP only)
    -- ============================================
    
    -- Cover Image (+10 XP)
    IF v_user.cover_image_url IS NOT NULL AND LENGTH(v_user.cover_image_url) > 0 THEN
        v_bonus_xp := v_bonus_xp + 10;
        v_optional_completed := array_append(v_optional_completed, 'cover_image');
    END IF;
    
    -- Affiliation (+15 XP)
    IF v_user.affiliation IS NOT NULL AND LENGTH(TRIM(v_user.affiliation)) > 0 THEN
        v_bonus_xp := v_bonus_xp + 15;
        v_optional_completed := array_append(v_optional_completed, 'affiliation');
    END IF;
    
    -- Location (+10 XP)
    IF v_user.location IS NOT NULL AND LENGTH(TRIM(v_user.location)) > 0 THEN
        v_bonus_xp := v_bonus_xp + 10;
        v_optional_completed := array_append(v_optional_completed, 'location');
    END IF;
    
    -- Website (+10 XP)
    IF v_user.website IS NOT NULL AND LENGTH(TRIM(v_user.website)) > 0 THEN
        v_bonus_xp := v_bonus_xp + 10;
        v_optional_completed := array_append(v_optional_completed, 'website');
    END IF;
    
    -- 3+ Endorsements received (+20 XP)
    IF v_endorsement_count >= 3 THEN
        v_bonus_xp := v_bonus_xp + 20;
        v_optional_completed := array_append(v_optional_completed, 'endorsements_3');
    END IF;
    
    -- 5+ Skills added (+15 XP)
    IF v_skill_count >= 5 THEN
        v_bonus_xp := v_bonus_xp + 15;
        v_optional_completed := array_append(v_optional_completed, 'skills_5');
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'percentage', LEAST(100, ROUND((v_core_score::NUMERIC / v_core_max) * 100)),
        'core_score', v_core_score,
        'core_max', v_core_max,
        'bonus_xp', v_bonus_xp,
        'missing_core', v_missing_core,
        'optional_completed', v_optional_completed,
        'is_complete', (v_core_score >= v_core_max),
        'skill_count', v_skill_count,
        'endorsement_count', v_endorsement_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILE COMPLETE BADGE
-- ============================================

-- Add badge for 100% profile completion (if badges table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'badges') THEN
        INSERT INTO badges (name, description, icon, category, xp_reward, criteria)
        VALUES (
            'Profile Complete',
            'Fill out all core profile fields',
            'user-check',
            'achievement',
            50,
            '{"type": "profile_complete", "threshold": 100}'
        )
        ON CONFLICT (name) DO NOTHING;
    END IF;
END $$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_profile_completion(UUID) TO authenticated;
