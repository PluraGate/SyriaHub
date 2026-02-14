-- Debug function to test trigger firing
CREATE OR REPLACE FUNCTION check_badges()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Trigger fired for user %', NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
