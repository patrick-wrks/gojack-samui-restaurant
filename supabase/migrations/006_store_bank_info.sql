-- Add bank account info to store settings
-- Run this in Supabase Dashboard → SQL Editor

-- Add bank account columns
ALTER TABLE store ADD COLUMN IF NOT EXISTS bank_name TEXT DEFAULT '';
ALTER TABLE store ADD COLUMN IF NOT EXISTS bank_account_number TEXT DEFAULT '';
ALTER TABLE store ADD COLUMN IF NOT EXISTS bank_account_name TEXT DEFAULT '';

-- Update the store settings with empty defaults if not set
UPDATE store 
SET bank_name = COALESCE(NULLIF(bank_name, ''), ''),
    bank_account_number = COALESCE(NULLIF(bank_account_number, ''), ''),
    bank_account_name = COALESCE(NULLIF(bank_account_name), '')
WHERE id = 1;
