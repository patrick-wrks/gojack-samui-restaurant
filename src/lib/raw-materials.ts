import type { RawMaterial, ProductIngredient, RawMaterialUnit } from '@/types/pos';
import { supabase } from './supabase';

const RAW_MATERIAL_UNITS: RawMaterialUnit[] = ['g', 'kg', 'pcs', 'ml'];

function toRawMaterial(row: {
  id: number;
  name: string;
  unit: string;
  stock_qty: number;
  low_stock_threshold: number | null;
  created_at?: string;
  updated_at?: string;
}): RawMaterial {
  return {
    id: row.id,
    name: row.name,
    unit: row.unit as RawMaterialUnit,
    stock_qty: Number(row.stock_qty),
    low_stock_threshold: row.low_stock_threshold != null ? Number(row.low_stock_threshold) : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export { RAW_MATERIAL_UNITS };

export async function fetchRawMaterials(): Promise<RawMaterial[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('raw_materials')
    .select('id, name, unit, stock_qty, low_stock_threshold, created_at, updated_at')
    .order('name', { ascending: true });
  if (error) {
    if (error.code === '42P01') return [];
    console.error('[fetchRawMaterials]', error);
    return [];
  }
  return (data ?? []).map(toRawMaterial);
}

export async function createRawMaterial(params: {
  name: string;
  unit?: RawMaterialUnit;
  stock_qty?: number;
  low_stock_threshold?: number | null;
}): Promise<{ rawMaterial: RawMaterial | null; error: string | null }> {
  if (!supabase) return { rawMaterial: null, error: 'Supabase is not configured.' };
  const unit = params.unit ?? 'g';
  const stock_qty = params.stock_qty ?? 0;
  if (stock_qty < 0) return { rawMaterial: null, error: 'Stock cannot be negative.' };
  const { data, error } = await supabase
    .from('raw_materials')
    .insert({
      name: params.name.trim(),
      unit,
      stock_qty,
      ...(params.low_stock_threshold != null && { low_stock_threshold: params.low_stock_threshold }),
    })
    .select('id, name, unit, stock_qty, low_stock_threshold, created_at, updated_at')
    .single();
  if (error) return { rawMaterial: null, error: error.message };
  if (!data) return { rawMaterial: null, error: 'No data returned.' };
  return { rawMaterial: toRawMaterial(data), error: null };
}

export async function updateRawMaterial(
  id: number,
  params: {
    name?: string;
    unit?: RawMaterialUnit;
    stock_qty?: number;
    low_stock_threshold?: number | null;
  }
): Promise<{ rawMaterial: RawMaterial | null; error: string | null }> {
  if (!supabase) return { rawMaterial: null, error: 'Supabase is not configured.' };
  if (params.stock_qty != null && params.stock_qty < 0) {
    return { rawMaterial: null, error: 'Stock cannot be negative.' };
  }
  const { data, error } = await supabase
    .from('raw_materials')
    .update({
      ...params,
      ...(params.name != null && { name: params.name.trim() }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, name, unit, stock_qty, low_stock_threshold, created_at, updated_at')
    .single();
  if (error) return { rawMaterial: null, error: error.message };
  if (!data) return { rawMaterial: null, error: 'No data returned.' };
  return { rawMaterial: toRawMaterial(data), error: null };
}

export async function deleteRawMaterial(id: number): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: false, error: 'Supabase is not configured.' };
  const { error } = await supabase.from('raw_materials').delete().eq('id', id);
  if (error) {
    if (error.code === '23503') {
      return { success: false, error: 'Cannot delete: used in one or more dishes. Remove from recipes first.' };
    }
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

/** Get count of products (dishes) that use this raw material */
export async function getRawMaterialUsageCount(rawMaterialId: number): Promise<number> {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from('product_ingredients')
    .select('*', { count: 'exact', head: true })
    .eq('raw_material_id', rawMaterialId);
  if (error) return 0;
  return count ?? 0;
}

// --- Product ingredients (recipe) ---

export async function fetchProductIngredients(productId: number): Promise<ProductIngredient[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('product_ingredients')
    .select('product_id, raw_material_id, quantity_per_serving')
    .eq('product_id', productId);
  if (error) {
    if (error.code === '42P01') return [];
    console.error('[fetchProductIngredients]', error);
    return [];
  }
  return (data ?? []).map((r) => ({
    product_id: r.product_id,
    raw_material_id: r.raw_material_id,
    quantity_per_serving: Number(r.quantity_per_serving),
  }));
}

export interface ProductIngredientWithName extends ProductIngredient {
  raw_material_name: string;
  raw_material_unit: string;
}

export async function fetchProductIngredientsWithNames(
  productId: number
): Promise<ProductIngredientWithName[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('product_ingredients')
    .select('product_id, raw_material_id, quantity_per_serving, raw_materials(name, unit)')
    .eq('product_id', productId);
  if (error) {
    if (error.code === '42P01') return [];
    console.error('[fetchProductIngredientsWithNames]', error);
    return [];
  }
  return (data ?? []).map((r: { product_id: number; raw_material_id: number; quantity_per_serving: number; raw_materials: { name: string; unit: string } | null }) => ({
    product_id: r.product_id,
    raw_material_id: r.raw_material_id,
    quantity_per_serving: Number(r.quantity_per_serving),
    raw_material_name: r.raw_materials?.name ?? '',
    raw_material_unit: r.raw_materials?.unit ?? 'g',
  }));
}

export async function addProductIngredient(
  productId: number,
  rawMaterialId: number,
  quantityPerServing: number
): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: false, error: 'Supabase is not configured.' };
  if (quantityPerServing <= 0) return { success: false, error: 'Quantity must be greater than 0.' };
  const { error } = await supabase.from('product_ingredients').upsert(
    {
      product_id: productId,
      raw_material_id: rawMaterialId,
      quantity_per_serving: quantityPerServing,
    },
    { onConflict: 'product_id,raw_material_id' }
  );
  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}

export async function removeProductIngredient(
  productId: number,
  rawMaterialId: number
): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: false, error: 'Supabase is not configured.' };
  const { error } = await supabase
    .from('product_ingredients')
    .delete()
    .eq('product_id', productId)
    .eq('raw_material_id', rawMaterialId);
  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}

export async function updateProductIngredientQuantity(
  productId: number,
  rawMaterialId: number,
  quantityPerServing: number
): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: false, error: 'Supabase is not configured.' };
  if (quantityPerServing <= 0) return { success: false, error: 'Quantity must be greater than 0.' };
  const { error } = await supabase
    .from('product_ingredients')
    .update({ quantity_per_serving: quantityPerServing })
    .eq('product_id', productId)
    .eq('raw_material_id', rawMaterialId);
  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}

/** Adjust raw material stock (restock or adjustment). Logs movement. */
export async function adjustRawMaterialStock(
  rawMaterialId: number,
  delta: number,
  type: 'restock' | 'adjustment' = 'adjustment',
  note?: string | null
): Promise<{ rawMaterial: RawMaterial | null; error: string | null }> {
  if (!supabase) return { rawMaterial: null, error: 'Supabase is not configured.' };
  const { data: current } = await supabase
    .from('raw_materials')
    .select('stock_qty')
    .eq('id', rawMaterialId)
    .single();
  if (!current) return { rawMaterial: null, error: 'Raw material not found.' };
  const newQty = Math.max(0, Number(current.stock_qty) + delta);
  const { data: updated, error: updateError } = await supabase
    .from('raw_materials')
    .update({ stock_qty: newQty, updated_at: new Date().toISOString() })
    .eq('id', rawMaterialId)
    .select('id, name, unit, stock_qty, low_stock_threshold, created_at, updated_at')
    .single();
  if (updateError) return { rawMaterial: null, error: updateError.message };
  const { error: movError } = await supabase.from('raw_material_movements').insert({
    raw_material_id: rawMaterialId,
    type,
    qty_delta: delta,
    note: note ?? null,
  });
  if (movError) console.warn('[adjustRawMaterialStock] Failed to log movement:', movError);
  return { rawMaterial: updated ? toRawMaterial(updated) : null, error: null };
}
