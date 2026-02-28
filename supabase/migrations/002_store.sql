-- Phase 3: Store settings (single row)
-- Run in Supabase Dashboard → SQL Editor after 001_menu.sql.

CREATE TABLE IF NOT EXISTS store (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name TEXT NOT NULL DEFAULT 'ร้านอาหารครัวไทย',
  store_address TEXT NOT NULL DEFAULT '',
  store_phone TEXT NOT NULL DEFAULT '',
  currency_symbol TEXT NOT NULL DEFAULT '฿',
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 7 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  prices_include_tax BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO store (id, store_name, store_address, store_phone, currency_symbol, tax_rate, prices_include_tax)
VALUES (1, 'ร้านอาหารครัวไทย', 'ภูเก็ต ประเทศไทย', '+66 76 123 456', '฿', 7, true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE store ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_authenticated_all" ON store;
CREATE POLICY "store_authenticated_all" ON store
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
