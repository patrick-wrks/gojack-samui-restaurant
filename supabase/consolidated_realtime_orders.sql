-- =============================================================================
-- CONSOLIDATED: Realtime + Products sequence + Orders + Order items + Table orders
-- Run this in ONE Supabase SQL Editor tab (after Tab 1 / menu setup).
-- =============================================================================

-- 1) Enable Realtime for menu tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'categories') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE categories;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'products') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  END IF;
END $$;

-- 2) Fix products id sequence so new menu items get a new id
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1));

-- 3) Orders table (for analytics)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number INT NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4) Order items table (line items per order)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id),
  product_name TEXT NOT NULL,
  qty INT NOT NULL CHECK (qty > 0),
  price_at_sale NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_status ON orders(created_at, status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_authenticated_all" ON orders;
CREATE POLICY "orders_authenticated_all" ON orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "order_items_authenticated_all" ON order_items;
CREATE POLICY "order_items_authenticated_all" ON order_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Realtime for orders
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
END $$;

-- 5) Table-based ordering: add table_number, allow open orders (status 'open', payment_method nullable)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_number TEXT;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IS NULL OR payment_method IN ('cash', 'bank'));

ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('open', 'completed', 'cancelled'));

ALTER TABLE orders ALTER COLUMN payment_method DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_status_table ON orders(status, table_number) WHERE status = 'open';
