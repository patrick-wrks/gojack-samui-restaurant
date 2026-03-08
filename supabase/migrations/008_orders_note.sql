-- Add optional note to orders (e.g. customer instructions, allergies)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS note TEXT;
