-- Migration: Clean up stale counter audit test data
-- This migration removes test data left behind by previous counter audit test runs
-- that didn't properly clean up after themselves.

-- Delete research gap upvotes for audit gaps
DELETE FROM public.research_gap_upvotes
WHERE gap_id IN (
  SELECT id FROM public.research_gaps 
  WHERE title LIKE 'Audit gap %'
);

-- Delete audit research gaps
DELETE FROM public.research_gaps WHERE title LIKE 'Audit gap %';

-- Delete poll votes for audit polls
DELETE FROM public.poll_votes
WHERE poll_id IN (
  SELECT id FROM public.polls 
  WHERE question LIKE 'Audit poll %'
);

-- Delete audit polls
DELETE FROM public.polls WHERE question LIKE 'Audit poll %';

-- Delete post votes for audit posts
DELETE FROM public.post_votes
WHERE post_id IN (
  SELECT id FROM public.posts 
  WHERE title LIKE 'Audit Article %' 
     OR title LIKE 'Audit Event %' 
     OR title LIKE 'Audit Source %'
);

-- Delete citations involving audit posts
DELETE FROM public.citations
WHERE source_post_id IN (
  SELECT id FROM public.posts 
  WHERE title LIKE 'Audit Article %' 
     OR title LIKE 'Audit Event %' 
     OR title LIKE 'Audit Source %'
) OR target_post_id IN (
  SELECT id FROM public.posts 
  WHERE title LIKE 'Audit Article %' 
     OR title LIKE 'Audit Event %' 
     OR title LIKE 'Audit Source %'
);

-- Delete comments on audit posts
DELETE FROM public.comments
WHERE post_id IN (
  SELECT id FROM public.posts 
  WHERE title LIKE 'Audit Article %' 
     OR title LIKE 'Audit Event %' 
     OR title LIKE 'Audit Source %'
);

-- Delete audit posts themselves
DELETE FROM public.posts 
WHERE title LIKE 'Audit Article %' 
   OR title LIKE 'Audit Event %' 
   OR title LIKE 'Audit Source %';

-- Delete follows between counter audit test users
DELETE FROM public.follows
WHERE follower_id IN (
  SELECT id FROM auth.users 
  WHERE email LIKE 'counter-audit-%@example.com'
) OR following_id IN (
  SELECT id FROM auth.users 
  WHERE email LIKE 'counter-audit-%@example.com'
);

-- Note: The test user accounts themselves will remain in auth.users
-- but their email pattern (counter-audit-*@example.com) makes them identifiable
-- and harmless. They should be cleaned up by the test's afterAll hook going forward.
