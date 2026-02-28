import type { CartItem, PaymentMethod } from '@/types/pos';
import { supabase } from './supabase';

export interface InsertOrderParams {
  orderNumber: number;
  total: number;
  paymentMethod: PaymentMethod;
  items: CartItem[];
}

export interface OrderWithItems {
  id: string;
  order_number: number;
  total: number;
  payment_method: PaymentMethod;
  status: string;
  created_at: string;
  order_items: {
    product_name: string;
    qty: number;
    price_at_sale: number;
  }[];
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
    product_id: i.id,
    product_name: i.name,
    qty: i.qty,
    price_at_sale: i.price,
  }));

  await supabase.from('order_items').insert(rows);
}

/**
 * Get the next order number by finding the max order_number + 1
 */
export async function getNextOrderNumber(): Promise<number> {
  if (!supabase) return 1;

  const { data, error } = await supabase
    .from('orders')
    .select('order_number')
    .order('order_number', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return 1;
  return data.order_number + 1;
}

/**
 * Fetch orders with date range for reports
 */
export async function fetchOrdersWithItems(
  startDate: string,
  endDate: string
): Promise<OrderWithItems[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      total,
      payment_method,
      status,
      created_at,
      order_items (
        product_name,
        qty,
        price_at_sale
      )
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as OrderWithItems[];
}

/**
 * Get today's orders for the POS header stats
 */
export async function fetchTodayStats(): Promise<{ revenue: number; orders: number }> {
  if (!supabase) return { revenue: 0, orders: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.toISOString();

  const { data, error } = await supabase
    .from('orders')
    .select('total')
    .gte('created_at', startOfDay)
    .eq('status', 'completed');

  if (error || !data) return { revenue: 0, orders: 0 };

  const revenue = data.reduce((sum, o) => sum + Number(o.total), 0);
  return { revenue, orders: data.length };
}
