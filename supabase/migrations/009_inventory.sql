-- Stock inventory tracking: add columns to products and optional stock_movements table
-- Run after 001_menu.sql (products) and 005_orders.sql (orders)

-- Add inventory columns to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_qty INT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INT;

-- Constraints: stock and threshold must be non-negative when set
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_qty_check;
ALTER TABLE products ADD CONSTRAINT products_stock_qty_check
  CHECK (stock_qty IS NULL OR stock_qty >= 0);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_low_stock_threshold_check;
ALTER TABLE products ADD CONSTRAINT products_low_stock_threshold_check
  CHECK (low_stock_threshold IS NULL OR low_stock_threshold >= 0);

-- Optional: stock_movements for analytics/audit
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('adjustment', 'sale', 'restock')),
  qty_delta INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at DESC);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "stock_movements_authenticated_all" ON stock_movements;
CREATE POLICY "stock_movements_authenticated_all" ON stock_movements
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Atomic decrement product stock (only when track_inventory = true).
-- Returns the new stock_qty, or NULL if product does not track inventory.
CREATE OR REPLACE FUNCTION decrement_product_stock(
  p_product_id BIGINT,
  p_qty INT,
  p_order_id UUID DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_qty INT;
BEGIN
  IF p_qty <= 0 THEN
    RETURN NULL;
  END IF;
  UPDATE products
  SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) - p_qty)
  WHERE id = p_product_id
    AND track_inventory = true
    AND (stock_qty IS NULL OR stock_qty >= 0)
  RETURNING stock_qty INTO v_new_qty;
  IF v_new_qty IS NOT NULL THEN
    INSERT INTO stock_movements (product_id, type, qty_delta, order_id)
    VALUES (p_product_id, 'sale', -p_qty, p_order_id);
  END IF;
  RETURN v_new_qty;
END;
$$;
