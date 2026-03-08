-- Ensure admin users have role 'admin' in user_roles
-- Run this to fix any admin users who may have missing or wrong roles

INSERT INTO public.user_roles (id, role)
SELECT id, 'admin'::user_role
FROM auth.users
WHERE email IN ('pwan@gojack.com', 'admin@gojack-samui.com')
ON CONFLICT (id) DO UPDATE SET role = 'admin'::user_role;
