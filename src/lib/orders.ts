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

export class OrderInsertError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'OrderInsertError';
  }
}

/**
 * Insert order and order_items into Supabase when client is configured.
 * Returns the order ID on success, throws OrderInsertError on failure.
 * No-op when supabase is not configured (e.g. missing env vars).
 */
export async function insertOrder(params: InsertOrderParams): Promise<string> {
  if (!supabase) {
    throw new OrderInsertError('Supabase client not configured');
  }

  console.log('[insertOrder] Saving order:', {
    orderNumber: params.orderNumber,
    total: params.total,
    paymentMethod: params.paymentMethod,
    items: params.items.length,
  });

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: params.orderNumber,
      total: params.total,
      payment_method: params.paymentMethod,
      status: 'completed',
    })
    .select('id, created_at')
    .single();

  if (orderError || !order) {
    console.error('[insertOrder] Failed to insert order:', orderError);
    throw new OrderInsertError(
      orderError?.message || 'Failed to create order',
      orderError
    );
  }

  console.log('[insertOrder] Order saved:', { id: order.id, created_at: order.created_at });

  const rows = params.items.map((i) => ({
    order_id: order.id,
    product_id: i.id,
    product_name: i.name,
    qty: i.qty,
    price_at_sale: i.price,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(rows);

  if (itemsError) {
    console.error('[insertOrder] Failed to insert order items:', itemsError);
    throw new OrderInsertError(
      `Order created but failed to save items: ${itemsError.message}`,
      itemsError
    );
  }

  console.log('[insertOrder] Order items saved:', rows.length, 'items');

  return order.id;
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

  console.log('[fetchOrders] Date range:', { startDate, endDate });

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

  if (error) {
    console.error('[fetchOrders] Error:', error);
    return [];
  }

  console.log('[fetchOrders] Found', data?.length || 0, 'orders');
  return data as OrderWithItems[];
}

/**
 * Format date to local timezone string for Supabase
 */
function toISOTimezone(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Get today's orders for the POS header stats
 */
export async function fetchTodayStats(): Promise<{ revenue: number; orders: number }> {
  if (!supabase) return { revenue: 0, orders: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = toISOTimezone(today);

  const { data, error } = await supabase
    .from('orders')
    .select('total')
    .gte('created_at', startOfDay)
    .eq('status', 'completed');

  if (error || !data) return { revenue: 0, orders: 0 };

  const revenue = data.reduce((sum, o) => sum + Number(o.total), 0);
  return { revenue, orders: data.length };
}
