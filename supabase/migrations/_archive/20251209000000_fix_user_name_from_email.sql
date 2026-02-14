-- ============================================
-- Fix: Derive user name from email address
-- ============================================
-- Problem: New users show as "Anonymous User" because email signup 
-- doesn't pass a name in raw_user_meta_data.
-- 
-- Solution: Extract username from email and format as proper name
-- Example: 'john.doe@example.com' → 'John Doe'
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, created_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      INITCAP(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', ' '))
    ),
    NEW.email,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The trigger 'on_auth_user_created' already exists and will 
-- automatically use the updated function.
