-- Bypass RLS recursion: fetch role via SECURITY DEFINER RPC instead of direct table read.
-- Fixes "infinite recursion detected in policy for relation user_roles"

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.user_role;
BEGIN
  SELECT role INTO r
  FROM public.user_roles
  WHERE id = auth.uid();
  RETURN r::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
