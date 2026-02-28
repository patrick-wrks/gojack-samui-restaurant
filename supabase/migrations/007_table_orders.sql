-- Table-based ordering: add table_number, allow open orders (status 'open', payment_method nullable)

-- Add table number column (nullable for existing POS orders)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_number TEXT;

-- Drop existing CHECK constraints (Postgres naming: orders_<column>_check)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Allow NULL payment_method for open orders; when set, only 'cash' or 'bank'
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IS NULL OR payment_method IN ('cash', 'bank'));

-- Allow status 'open', 'completed', 'cancelled'
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('open', 'completed', 'cancelled'));

-- Make payment_method nullable for open orders
ALTER TABLE orders ALTER COLUMN payment_method DROP NOT NULL;

-- Index for open-order lookups by table
CREATE INDEX IF NOT EXISTS idx_orders_status_table ON orders(status, table_number) WHERE status = 'open';
