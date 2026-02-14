-- ============================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================

-- 1. Indexes for Posts Filtering and Sorting
-- Already has posts_created_at_idx ON posts(created_at DESC)
-- Already has posts_author_id_idx ON posts(author_id)
-- Already has posts_content_type_idx ON posts(content_type)
-- Already has posts_status_idx ON posts(status)
-- Already has idx_posts_approval_status ON posts(approval_status)

-- Missing: Index on vote_count for sorting by 'hot' and 'top'
CREATE INDEX IF NOT EXISTS idx_posts_vote_count ON posts(vote_count DESC NULLS LAST);

-- Composite index for the most common feed query: published posts by date
-- Covers: .eq('status', 'published').neq('approval_status', 'rejected').neq('content_type', 'resource').order('created_at', { ascending: false })
CREATE INDEX IF NOT EXISTS idx_posts_feed_composite 
ON posts(status, approval_status, content_type, created_at DESC);

-- 2. Indexes for Stats and User following
-- Tags in the tags table are considered verified/approved
-- idx_posts_status_approval already exists or is covered by composite

-- 3. Consolidated Platform Stats RPC
-- Consolidates 3 queries into 1 round-trip for the landing page hero
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSONB AS $$
DECLARE
    contributors_count INTEGER;
    publications_count INTEGER;
    topics_count INTEGER;
BEGIN
    -- Count users who have published at least one post (contributors)
    -- We approximate this by counting all researchers for now as per current logic
    -- In a high-scale app, this might be a pre-calculated table
    SELECT COUNT(*) INTO contributors_count FROM users;

    -- Count published posts (excluding rejected)
    SELECT COUNT(*) INTO publications_count 
    FROM posts 
    WHERE status = 'published' 
    AND (approval_status IS NULL OR approval_status != 'rejected');

    -- Count all tags (tags in the tags table are considered verified/approved)
    SELECT COUNT(*) INTO topics_count 
    FROM tags;

    RETURN jsonb_build_object(
        'contributors', contributors_count,
        'publications', publications_count,
        'contexts', topics_count
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_platform_stats() TO anon, authenticated;

-- 4. RPC for efficient feed with authors (Optional but recommended for client-side fetches)
-- For now we'll stick to joining in JS using .select('*, author:users(...)') as PostgREST does this relatively well
-- but we ensure the indexes are there to support the join.
