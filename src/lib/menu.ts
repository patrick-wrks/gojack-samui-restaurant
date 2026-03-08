import type { Category, Product } from '@/types/pos';
import { supabase } from './supabase';

export interface DbCategory {
  id: string;
  name: string;
  color: string;
  sort_order: number;
}

export interface DbProduct {
  id: number;
  category_id: string;
  name: string;
  price: number;
  is_active: boolean;
  sort_order: number;
  track_inventory?: boolean;
  stock_qty?: number | null;
  low_stock_threshold?: number | null;
}

function toCategory(row: DbCategory): Category {
  return { id: row.id, name: row.name, color: row.color };
}

function toProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    cat: row.category_id,
    price: Number(row.price),
    is_active: row.is_active,
    track_inventory: row.track_inventory ?? false,
    stock_qty: row.stock_qty != null ? row.stock_qty : null,
    low_stock_threshold: row.low_stock_threshold != null ? row.low_stock_threshold : null,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, color, sort_order')
    .order('sort_order', { ascending: true });
  if (error || !data) return [];
  return (data as DbCategory[]).map(toCategory);
}

export async function createCategory(params: {
  name: string;
  color?: string;
  sort_order?: number;
}): Promise<{ category: Category | null; error: string | null }> {
  if (!supabase) {
    return { category: null, error: 'Supabase is not configured.' };
  }
  const id = `cat_${Date.now()}`;
  const color = params.color ?? '#6b7280';
  const { data, error } = await supabase
    .from('categories')
    .insert({
      id,
      name: params.name.trim(),
      color,
      sort_order: params.sort_order ?? 0,
    })
    .select('id, name, color, sort_order')
    .single();
  if (error) return { category: null, error: error.message };
  if (!data) return { category: null, error: 'No data returned.' };
  return { category: toCategory(data as DbCategory), error: null };
}

export async function fetchProducts(activeOnly = true): Promise<Product[]> {
  if (!supabase) return [];
  const inventoryColumns = 'track_inventory, stock_qty, low_stock_threshold';
  const baseColumns = 'id, category_id, name, price, is_active, sort_order';
  let q = supabase
    .from('products')
    .select(`${baseColumns}, ${inventoryColumns}`)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error) {
    if (error.code === '42703' || error.message?.includes('does not exist')) {
      return fetchProductsWithoutInventory(activeOnly);
    }
    return [];
  }
  if (!data) return [];
  return (data as DbProduct[]).map(toProduct);
}

async function fetchProductsWithoutInventory(activeOnly: boolean): Promise<Product[]> {
  if (!supabase) return [];
  let q = supabase
    .from('products')
    .select('id, category_id, name, price, is_active, sort_order')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as DbProduct[]).map((row) => toProduct({
    ...row,
    track_inventory: false,
    stock_qty: null,
    low_stock_threshold: null,
  }));
}

export async function createProduct(params: {
  category_id: string;
  name: string;
  price: number;
  track_inventory?: boolean;
  stock_qty?: number | null;
  low_stock_threshold?: number | null;
}): Promise<{ product: Product | null; error: string | null }> {
  if (!supabase) return { product: null, error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' };
  const { data, error } = await supabase
    .from('products')
    .insert({
      category_id: params.category_id,
      name: params.name,
      price: params.price,
      is_active: true,
      sort_order: 0,
      track_inventory: params.track_inventory ?? false,
      ...(params.stock_qty != null && { stock_qty: params.stock_qty }),
      ...(params.low_stock_threshold != null && { low_stock_threshold: params.low_stock_threshold }),
    })
    .select('id, category_id, name, price, is_active, sort_order, track_inventory, stock_qty, low_stock_threshold')
    .single();
  if (error) return { product: null, error: error.message };
  if (!data) return { product: null, error: 'No data returned from server.' };
  return { product: toProduct(data as DbProduct), error: null };
}

export async function updateProduct(
  id: number,
  params: {
    category_id?: string;
    name?: string;
    price?: number;
    is_active?: boolean;
    track_inventory?: boolean;
    stock_qty?: number | null;
    low_stock_threshold?: number | null;
  }
): Promise<{ product: Product | null; error: string | null }> {
  if (!supabase) return { product: null, error: 'Supabase is not configured.' };
  const { data, error } = await supabase
    .from('products')
    .update(params)
    .eq('id', id)
    .select('id, category_id, name, price, is_active, sort_order, track_inventory, stock_qty, low_stock_threshold')
    .single();
  if (error) return { product: null, error: error.message };
  if (!data) return { product: null, error: 'No data returned from server.' };
  return { product: toProduct(data as DbProduct), error: null };
}

/**
 * Quick-adjust product stock (for inline +/- in products page).
 * Only applies when product has track_inventory = true.
 */
export async function updateProductStock(
  productId: number,
  newQty: number
): Promise<{ product: Product | null; error: string | null }> {
  if (!supabase) return { product: null, error: 'Supabase is not configured.' };
  if (newQty < 0) return { product: null, error: 'Stock cannot be negative.' };
  const { data, error } = await supabase
    .from('products')
    .update({ stock_qty: newQty })
    .eq('id', productId)
    .select('id, category_id, name, price, is_active, sort_order, track_inventory, stock_qty, low_stock_threshold')
    .single();
  if (error) return { product: null, error: error.message };
  if (!data) return { product: null, error: 'No data returned from server.' };
  return { product: toProduct(data as DbProduct), error: null };
}

export async function deleteProduct(id: number): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: false, error: 'Supabase is not configured.' };
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}
