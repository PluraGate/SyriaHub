-- Migration: Add optional Turnstile requirement for polls and surveys
-- This allows poll/survey creators to opt-in to CAPTCHA verification for enhanced bot protection

-- Add require_turnstile column to polls
ALTER TABLE polls ADD COLUMN IF NOT EXISTS require_turnstile BOOLEAN DEFAULT false;

-- Add require_turnstile column to surveys  
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS require_turnstile BOOLEAN DEFAULT false;

-- Add comments documenting the purpose
COMMENT ON COLUMN polls.require_turnstile IS 
'When true, public votes require Turnstile CAPTCHA verification to reduce bot/spam abuse';

COMMENT ON COLUMN surveys.require_turnstile IS 
'When true, public responses require Turnstile CAPTCHA verification to reduce bot/spam abuse';
