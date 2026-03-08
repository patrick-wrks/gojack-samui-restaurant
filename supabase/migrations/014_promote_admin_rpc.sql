-- One-click admin fix: RPC that promotes eligible users (email contains admin+gojack) to admin role.
-- Runs with SECURITY DEFINER so it can read auth.users and update user_roles.
-- Only promotes if email matches - safe to call from client.

CREATE OR REPLACE FUNCTION public.promote_admin_if_eligible()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  user_email text;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not authenticated');
  END IF;

  SELECT email INTO user_email FROM auth.users WHERE id = uid;
  IF user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user not found');
  END IF;

  -- Only promote if email contains both 'admin' and 'gojack' (case-insensitive)
  IF LOWER(user_email) NOT LIKE '%admin%' OR LOWER(user_email) NOT LIKE '%gojack%' THEN
    RETURN jsonb_build_object('success', false, 'error', 'not eligible', 'email', user_email);
  END IF;

  INSERT INTO public.user_roles (id, role)
  VALUES (uid, 'admin'::user_role)
  ON CONFLICT (id) DO UPDATE SET role = 'admin'::user_role;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.promote_admin_if_eligible() TO authenticated;
