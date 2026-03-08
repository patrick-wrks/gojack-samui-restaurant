import type { Product } from '@/types/pos';
import { supabase } from './supabase';
import { fetchProducts } from './menu';

export interface StockMovementRow {
  id: string;
  product_id: number;
  type: 'adjustment' | 'sale' | 'restock';
  qty_delta: number;
  created_at: string;
  order_id: string | null;
  note: string | null;
  /** From join with products(name); may be object or array depending on Supabase client */
  products?: { name: string } | { name: string }[] | null;
}

/**
 * Fetch products that are low or out of stock (track_inventory = true and
 * stock_qty <= low_stock_threshold, or stock_qty <= 0).
 */
export async function fetchLowStockProducts(): Promise<Product[]> {
  const all = await fetchProducts(false);
  return all.filter(
    (p) =>
      p.track_inventory &&
      p.stock_qty != null &&
      (p.stock_qty <= 0 ||
        (p.low_stock_threshold != null && p.stock_qty <= p.low_stock_threshold))
  );
}

/**
 * Fetch stock movements for analytics. Returns movements in the date range.
 * Requires stock_movements table to exist (migration 009).
 */
export async function fetchStockMovements(
  startDate: string,
  endDate: string
): Promise<StockMovementRow[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('stock_movements')
    .select('id, product_id, type, qty_delta, created_at, order_id, note, products(name)')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') {
      // relation "stock_movements" does not exist
      return [];
    }
    console.error('[fetchStockMovements] Error:', error);
    return [];
  }
  return (data ?? []) as StockMovementRow[];
}

/**
 * Decrement product stock (atomic). Only affects products with track_inventory = true.
 * Uses DB function decrement_product_stock. Logs warning if product doesn't track or table missing.
 */
export async function decrementProductStock(
  productId: number,
  qty: number,
  orderId?: string | null
): Promise<void> {
  if (!supabase || qty <= 0) return;

  const { error } = await supabase.rpc('decrement_product_stock', {
    p_product_id: productId,
    p_qty: qty,
    p_order_id: orderId ?? null,
  });

  if (error) {
    if (error.code === '42883') {
      // function does not exist (migration not run)
      return;
    }
    console.warn('[decrementProductStock]', productId, qty, error.message);
  }
}

/**
 * Decrement raw material stock for all items in an order (based on product_ingredients).
 * Calls DB function decrement_raw_material_stock. No-op if function or tables don't exist.
 * Throws if insufficient stock so caller can block order completion.
 */
export async function decrementRawMaterialStock(orderId: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.rpc('decrement_raw_material_stock', {
    p_order_id: orderId,
  });

  if (error) {
    if (error.code === '42883' || error.code === '42P01') {
      // function or table does not exist (migration not run) — no-op
      return;
    }
    // Insufficient stock or other error — rethrow so order can be blocked
    throw new Error(error.message);
  }
}
