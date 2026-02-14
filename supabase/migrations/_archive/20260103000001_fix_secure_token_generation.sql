-- Migration: Fix public token generation to use cryptographically secure random
-- Issue: Previous implementation used random() which is not cryptographically secure
-- Solution: Use gen_random_bytes() for cryptographic randomness

-- =====================================================
-- Function to generate unique public token (secure version)
-- Uses cryptographically secure random bytes instead of random()
-- =====================================================

CREATE OR REPLACE FUNCTION generate_public_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    random_bytes BYTEA;
    i INTEGER;
BEGIN
    -- Generate 12 cryptographically secure random bytes
    random_bytes := gen_random_bytes(12);
    
    FOR i IN 0..11 LOOP
        -- Use each byte to select a character from the charset
        -- get_byte returns 0-255, mod by charset length gives valid index
        result := result || substr(chars, 1 + (get_byte(random_bytes, i) % length(chars)), 1);
    END LOOP;
    
    RETURN result;
END;
$$;

-- Add comment documenting the security consideration
COMMENT ON FUNCTION generate_public_token() IS 
'Generates a 12-character cryptographically secure random token for public sharing. 
Uses gen_random_bytes() for proper randomness instead of random().';
