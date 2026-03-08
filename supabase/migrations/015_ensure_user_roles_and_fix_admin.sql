-- Ensure user_roles table exists, RLS allows self-read, and admin@gojack-samui.com has admin role.
-- Root cause: user_roles table/enum may have been created manually; RLS may block reads; or admin row missing.

-- 1. Create user_role enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('admin', 'kitchen', 'cashier');
  END IF;
END
$$;

-- 2. Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'cashier'
);

-- 3. Enable RLS and ensure users can read their own role (required for client-side role fetch)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- 4. Grant usage for authenticated users
GRANT SELECT ON public.user_roles TO authenticated;

-- 5. Fix admin@gojack-samui.com: INSERT or UPDATE to admin (case-insensitive email match)
INSERT INTO public.user_roles (id, role)
SELECT id, 'admin'::public.user_role
FROM auth.users
WHERE LOWER(TRIM(email)) = 'admin@gojack-samui.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin'::public.user_role;
