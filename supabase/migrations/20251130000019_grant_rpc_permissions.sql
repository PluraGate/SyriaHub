-- Grant execute permissions on the RPC function
GRANT EXECUTE ON FUNCTION get_unverified_tags() TO postgres, anon, authenticated, service_role;
