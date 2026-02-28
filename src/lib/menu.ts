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

export async function fetchProducts(activeOnly = true): Promise<Product[]> {
  if (!supabase) return [];
  let q = supabase
    .from('products')
    .select('id, category_id, name, price, is_active, sort_order')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as DbProduct[]).map(toProduct);
}

export async function createProduct(params: {
  category_id: string;
  name: string;
  price: number;
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
    })
    .select('id, category_id, name, price, is_active, sort_order')
    .single();
  if (error) return { product: null, error: error.message };
  if (!data) return { product: null, error: 'No data returned from server.' };
  return { product: toProduct(data as DbProduct), error: null };
}

export async function updateProduct(
  id: number,
  params: { category_id?: string; name?: string; price?: number; is_active?: boolean }
): Promise<{ product: Product | null; error: string | null }> {
  if (!supabase) return { product: null, error: 'Supabase is not configured.' };
  const { data, error } = await supabase
    .from('products')
    .update(params)
    .eq('id', id)
    .select('id, category_id, name, price, is_active, sort_order')
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
