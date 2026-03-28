-- Function to get user ID by email
-- This function has SECURITY DEFINER to access auth.users
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;

  RETURN user_id;
END;
$$;

-- Function to get group members with user emails
-- This function has SECURITY DEFINER to access auth.users
CREATE OR REPLACE FUNCTION get_group_members_with_emails(p_group_id UUID)
RETURNS TABLE (
  id UUID,
  group_id UUID,
  user_id UUID,
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gm.id,
    gm.group_id,
    gm.user_id,
    au.email as user_email,
    gm.created_at
  FROM group_members gm
  JOIN auth.users au ON au.id = gm.user_id
  WHERE gm.group_id = p_group_id
  ORDER BY gm.created_at ASC;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_group_members_with_emails(UUID) TO authenticated;
