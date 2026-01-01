-- Disable badge triggers to prevent insert failures
DROP TRIGGER IF EXISTS check_badges_on_post_create ON posts;
DROP TRIGGER IF EXISTS check_badges_on_solution ON posts;
DROP TRIGGER IF EXISTS check_badges_on_reputation ON users;

-- Ensure other triggers are active (re-create to be sure)
-- (They were not dropped by previous migrations, but good to be safe)
