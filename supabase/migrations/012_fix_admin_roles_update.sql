-- Update existing user_roles rows to admin (targets users who already have a row)
-- Uses broader email pattern to catch variations like Admin@..., admin@..., etc.

UPDATE public.user_roles ur
SET role = 'admin'::user_role
FROM auth.users u
WHERE ur.id = u.id
  AND (
    LOWER(u.email) LIKE 'admin@gojack-samui%'
    OR LOWER(u.email) LIKE 'pwan@gojack%'
  );
