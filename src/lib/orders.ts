import type { CartItem, PaymentMethod } from '@/types/pos';
import { supabase } from './supabase';

export interface InsertOrderParams {
  orderNumber: number;
  total: number;
  paymentMethod: PaymentMethod;
  items: CartItem[];
}

/**
 * Insert order and order_items into Supabase when client is configured.
 * No-op when supabase is not configured (e.g. missing env vars).
 */
export async function insertOrder(params: InsertOrderParams): Promise<void> {
  if (!supabase) return;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: params.orderNumber,
      total: params.total,
      payment_method: params.paymentMethod,
      status: 'completed',
    })
    .select('id')
    .single();

  if (orderError || !order) return;

  const rows = params.items.map((i) => ({
    order_id: order.id,
    product_id: null,
    product_name: i.name,
    qty: i.qty,
    price_at_sale: i.price,
  }));

  await supabase.from('order_items').insert(rows);
}
