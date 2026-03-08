-- Manual fix: set your user to admin role
-- 1. Log in to the app, click the yellow "Cashier" badge to copy your userId
-- 2. Replace YOUR_USER_ID below with that UUID
-- 3. Run this in Supabase Dashboard → SQL Editor

UPDATE public.user_roles
SET role = 'admin'::user_role
WHERE id = 'YOUR_USER_ID';
