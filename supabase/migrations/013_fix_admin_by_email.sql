-- Fix admin role: update user_roles for any user whose email contains 'admin' and 'gojack'
-- Run this, then replace YOUR_USER_ID below with the actual UUID from the yellow badge (click it to copy)
-- Then run: UPDATE public.user_roles SET role = 'admin'::user_role WHERE id = 'YOUR_USER_ID';

-- First try: update by email pattern (catches admin@gojack-samui.com, Admin@..., etc.)
UPDATE public.user_roles ur
SET role = 'admin'::user_role
FROM auth.users u
WHERE ur.id = u.id
  AND LOWER(u.email) LIKE '%admin%'
  AND LOWER(u.email) LIKE '%gojack%';
