-- Fix products id sequence after seed data was inserted with OVERRIDING SYSTEM VALUE.
-- Run this once in Supabase SQL Editor if you get "duplicate key value violates unique constraint products_pkey" when adding a new menu item.
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1));
