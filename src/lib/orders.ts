import type { CartItem, OrderStatus, PaymentMethod } from '@/types/pos';
import { supabase } from './supabase';

export interface InsertOrderParams {
  orderNumber: number;
  total: number;
  paymentMethod: PaymentMethod;
  items: CartItem[];
}

export interface OrderItemRow {
  product_id?: number;
  product_name: string;
  qty: number;
  price_at_sale: number;
}

export interface OrderWithItems {
  id: string;
  order_number: number;
  total: number;
  payment_method: PaymentMethod | null;
  status: OrderStatus;
  table_number: string | null;
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

export class OrderDeleteError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'OrderDeleteError';
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
      table_number,
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

/**
 * Delete an order and its items (cascade delete handled by foreign key)
 */
export async function deleteOrder(orderId: string): Promise<void> {
  if (!supabase) {
    throw new OrderDeleteError('Supabase client not configured');
  }

  console.log('[deleteOrder] Deleting order:', orderId);

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) {
    console.error('[deleteOrder] Failed to delete order:', error);
    throw new OrderDeleteError(
      error.message || 'Failed to delete order',
      error
    );
  }

  console.log('[deleteOrder] Order deleted:', orderId);
}

/**
 * Create an open order for a table (table-based ordering).
 * Returns the new order ID.
 */
export async function createOpenOrder(
  tableNumber: string,
  items: CartItem[] = []
): Promise<string> {
  if (!supabase) {
    throw new OrderInsertError('Supabase client not configured');
  }

  const orderNumber = await getNextOrderNumber();
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      total,
      table_number: tableNumber,
      payment_method: null,
      status: 'open',
    })
    .select('id, created_at')
    .single();

  if (orderError || !order) {
    console.error('[createOpenOrder] Failed to insert order:', orderError);
    throw new OrderInsertError(
      orderError?.message || 'Failed to create open order',
      orderError
    );
  }

  if (items.length > 0) {
    const rows = items.map((i) => ({
      order_id: order.id,
      product_id: i.id,
      product_name: i.name,
      qty: i.qty,
      price_at_sale: i.price,
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(rows);
    if (itemsError) {
      console.error('[createOpenOrder] Failed to insert order items:', itemsError);
      throw new OrderInsertError(
        `Order created but failed to save items: ${itemsError.message}`,
        itemsError
      );
    }
  }

  return order.id;
}

/**
 * Fetch all open orders with their items (for Tables page list).
 */
export async function fetchOpenOrders(): Promise<OrderWithItems[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      total,
      payment_method,
      status,
      table_number,
      created_at,
      order_items (
        product_name,
        qty,
        price_at_sale
      )
    `)
    .eq('status', 'open')
    .order('table_number', { ascending: true });

  if (error) {
    console.error('[fetchOpenOrders] Error:', error);
    return [];
  }
  return (data ?? []) as OrderWithItems[];
}

/**
 * Fetch the open order for a given table number, or null if none.
 */
export async function fetchOpenOrderByTable(
  tableNumber: string
): Promise<OrderWithItems | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      total,
      payment_method,
      status,
      table_number,
      created_at,
      order_items (
        product_name,
        qty,
        price_at_sale
      )
    `)
    .eq('status', 'open')
    .eq('table_number', tableNumber)
    .maybeSingle();

  if (error || !data) return null;
  return data as OrderWithItems;
}

/**
 * Add items to an existing open order and update its total.
 */
export async function addItemsToOpenOrder(
  orderId: string,
  items: OrderItemRow[]
): Promise<void> {
  if (!supabase) {
    throw new OrderInsertError('Supabase client not configured');
  }
  if (items.length === 0) return;

  const rows = items.map((i) => ({
    order_id: orderId,
    product_id: i.product_id,
    product_name: i.product_name,
    qty: i.qty,
    price_at_sale: i.price_at_sale,
  }));
  const { error: insertError } = await supabase.from('order_items').insert(rows);
  if (insertError) {
    throw new OrderInsertError(
      `Failed to add items: ${insertError.message}`,
      insertError
    );
  }

  const { data: existingItems } = await supabase
    .from('order_items')
    .select('qty, price_at_sale')
    .eq('order_id', orderId);
  const total =
    (existingItems ?? []).reduce(
      (sum, r) => sum + Number(r.qty) * Number(r.price_at_sale),
      0
    );
  const { error: updateError } = await supabase
    .from('orders')
    .update({ total })
    .eq('id', orderId);
  if (updateError) {
    console.error('[addItemsToOpenOrder] Failed to update total:', updateError);
  }
}

/**
 * Complete an open order (checkout): set status, payment_method, and total.
 * Order then appears in reports (status = 'completed').
 */
export async function completeOrder(
  orderId: string,
  paymentMethod: PaymentMethod,
  total: number
): Promise<void> {
  if (!supabase) {
    throw new OrderInsertError('Supabase client not configured');
  }

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'completed',
      payment_method: paymentMethod,
      total,
    })
    .eq('id', orderId);

  if (error) {
    console.error('[completeOrder] Error:', error);
    throw new OrderInsertError(
      error.message || 'Failed to complete order',
      error
    );
  }
}
