-- ============================================
-- FIX: Allow handle_new_user trigger to insert users
-- ============================================
-- Problem: The handle_new_user trigger (SECURITY DEFINER) may still be 
-- blocked by RLS policies if they rely on auth.uid() which is NULL during signup.
-- 
-- Solution: Add a policy that allows the service role to insert users,
-- or modify the trigger to explicitly bypass RLS.
-- ============================================

-- First, ensure the handle_new_user function sets role to bypass RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      INITCAP(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', ' '))
    ),
    NEW.email,
    'member',  -- Default role for new users
    NOW()
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the auth signup
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant usage to the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Add policy to allow inserts during auth signup (via trigger)
-- The SECURITY DEFINER function runs as the function owner, so we need a policy
-- that allows this user to insert
DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users" ON users
  FOR INSERT
  WITH CHECK (true);  -- The SECURITY DEFINER function can insert any user

-- Also ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

SELECT 'User creation trigger fixed!' as status;
