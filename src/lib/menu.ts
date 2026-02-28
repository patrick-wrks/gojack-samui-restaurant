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
}): Promise<Product | null> {
  if (!supabase) return null;
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
  if (error || !data) return null;
  return toProduct(data as DbProduct);
}

export async function updateProduct(
  id: number,
  params: { category_id?: string; name?: string; price?: number; is_active?: boolean }
): Promise<Product | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('products')
    .update(params)
    .eq('id', id)
    .select('id, category_id, name, price, is_active, sort_order')
    .single();
  if (error || !data) return null;
  return toProduct(data as DbProduct);
}
