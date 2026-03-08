-- Fix admin roles: use case-insensitive email matching
-- Some auth providers may store email with different casing

INSERT INTO public.user_roles (id, role)
SELECT id, 'admin'::user_role
FROM auth.users
WHERE LOWER(TRIM(email)) IN ('pwan@gojack.com', 'admin@gojack-samui.com')
ON CONFLICT (id) DO UPDATE SET role = 'admin'::user_role;
