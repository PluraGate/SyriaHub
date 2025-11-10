-- Adds preferred locale support so personalization can roll out incrementally.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS preferred_locale TEXT;

UPDATE users
SET preferred_locale = 'en'
WHERE preferred_locale IS NULL;

ALTER TABLE users
  ALTER COLUMN preferred_locale SET DEFAULT 'en';

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_preferred_locale_check;

ALTER TABLE users
  ADD CONSTRAINT users_preferred_locale_check CHECK (preferred_locale IN ('en', 'ar'));

ALTER TABLE users
  ALTER COLUMN preferred_locale SET NOT NULL;

COMMENT ON COLUMN users.preferred_locale IS 'Preferred UI locale for the user (en or ar).';
