-- Fix audit_counter_mismatches to handle optional group_members table
-- Recreates function to avoid hard dependency on missing tables

CREATE OR REPLACE FUNCTION audit_counter_mismatches()
RETURNS TABLE (
  counter_type TEXT,
  entity_id UUID,
  counter_name TEXT,
  expected_value NUMERIC,
  actual_value NUMERIC,
  details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_follows BOOLEAN := to_regclass('public.follows') IS NOT NULL;
  v_has_group_members BOOLEAN := to_regclass('public.group_members') IS NOT NULL;
  v_user RECORD;
  v_stats JSONB;
  v_post_count BIGINT := 0;
  v_event_count BIGINT := 0;
  v_comment_count BIGINT := 0;
  v_follower_count BIGINT := 0;
  v_following_count BIGINT := 0;
  v_group_count BIGINT := 0;
  v_citations_received BIGINT := 0;
BEGIN
  -- Posts: vote_count should equal SUM(post_votes.value)
  RETURN QUERY
  SELECT
    'post_vote_count'::text,
    p.id,
    'vote_count'::text,
    COALESCE(SUM(pv.value), 0)::numeric,
    COALESCE(p.vote_count, 0)::numeric,
    jsonb_build_object('post_id', p.id)
  FROM posts p
  LEFT JOIN post_votes pv ON pv.post_id = p.id
  GROUP BY p.id, p.vote_count
  HAVING COALESCE(SUM(pv.value), 0) <> COALESCE(p.vote_count, 0);

  -- Polls: total_votes should equal COUNT(poll_votes)
  RETURN QUERY
  SELECT
    'poll_total_votes'::text,
    p.id,
    'total_votes'::text,
    COUNT(v.*)::numeric,
    COALESCE(p.total_votes, 0)::numeric,
    jsonb_build_object('poll_id', p.id)
  FROM polls p
  LEFT JOIN poll_votes v ON v.poll_id = p.id
  GROUP BY p.id, p.total_votes
  HAVING COUNT(v.*) <> COALESCE(p.total_votes, 0);

  -- Polls: each option vote_count should match votes referencing that option id
  RETURN QUERY
  SELECT
    'poll_option_votes'::text,
    p.id,
    'option_vote_count'::text,
    expected.expected_count::numeric,
    actual.actual_count::numeric,
    jsonb_build_object('poll_id', p.id, 'option_id', opt->>'id')
  FROM polls p
  CROSS JOIN LATERAL jsonb_array_elements(p.options) opt
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::int AS expected_count
    FROM poll_votes v
    WHERE v.poll_id = p.id
      AND opt->>'id' = ANY(v.option_ids)
  ) expected ON true
  LEFT JOIN LATERAL (
    SELECT COALESCE((opt->>'vote_count')::int, 0) AS actual_count
  ) actual ON true
  WHERE expected.expected_count <> actual.actual_count;

  -- Research gaps: upvote_count should equal COUNT(research_gap_upvotes)
  RETURN QUERY
  SELECT
    'research_gap_upvotes'::text,
    g.id,
    'upvote_count'::text,
    COUNT(u.*)::numeric,
    COALESCE(g.upvote_count, 0)::numeric,
    jsonb_build_object('gap_id', g.id)
  FROM research_gaps g
  LEFT JOIN research_gap_upvotes u ON u.gap_id = g.id
  GROUP BY g.id, g.upvote_count
  HAVING COUNT(u.*) <> COALESCE(g.upvote_count, 0);

  -- User stats: compare get_user_stats() output against base-table aggregates
  FOR v_user IN SELECT id FROM users LOOP
    SELECT COUNT(*) INTO v_post_count
    FROM posts
    WHERE author_id = v_user.id
      AND status = 'published'
      AND (content_type IS NULL OR content_type != 'event');

    SELECT COUNT(*) INTO v_event_count
    FROM posts
    WHERE author_id = v_user.id
      AND status = 'published'
      AND content_type = 'event';

    SELECT COUNT(*) INTO v_comment_count FROM comments WHERE user_id = v_user.id;

    IF v_has_follows THEN
      SELECT COUNT(*) INTO v_follower_count FROM follows WHERE following_id = v_user.id;
      SELECT COUNT(*) INTO v_following_count FROM follows WHERE follower_id = v_user.id;
    ELSE
      v_follower_count := 0;
      v_following_count := 0;
    END IF;

    IF v_has_group_members THEN
      SELECT COUNT(*) INTO v_group_count FROM group_members WHERE user_id = v_user.id;
    ELSE
      v_group_count := 0;
    END IF;

    SELECT COUNT(*) INTO v_citations_received
    FROM citations c
    JOIN posts p ON p.id = c.target_post_id
    WHERE p.author_id = v_user.id;

    v_stats := get_user_stats(v_user.id);

    IF v_post_count <> COALESCE((v_stats->>'post_count')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'post_count',
        v_post_count::numeric, COALESCE((v_stats->>'post_count')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;

    IF v_event_count <> COALESCE((v_stats->>'event_count')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'event_count',
        v_event_count::numeric, COALESCE((v_stats->>'event_count')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;

    IF v_comment_count <> COALESCE((v_stats->>'comment_count')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'comment_count',
        v_comment_count::numeric, COALESCE((v_stats->>'comment_count')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;

    IF v_follower_count <> COALESCE((v_stats->>'follower_count')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'follower_count',
        v_follower_count::numeric, COALESCE((v_stats->>'follower_count')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;

    IF v_following_count <> COALESCE((v_stats->>'following_count')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'following_count',
        v_following_count::numeric, COALESCE((v_stats->>'following_count')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;

    IF v_group_count <> COALESCE((v_stats->>'group_count')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'group_count',
        v_group_count::numeric, COALESCE((v_stats->>'group_count')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;

    IF v_citations_received <> COALESCE((v_stats->>'citations_received')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'citations_received',
        v_citations_received::numeric, COALESCE((v_stats->>'citations_received')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;

    IF (v_citations_received * 10) <> COALESCE((v_stats->>'academic_impact')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'academic_impact',
        (v_citations_received * 10)::numeric, COALESCE((v_stats->>'academic_impact')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION audit_counter_mismatches() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION audit_counter_mismatches() TO service_role;
COMMENT ON FUNCTION audit_counter_mismatches() IS 'Returns rows for any mismatched derived counters.';
