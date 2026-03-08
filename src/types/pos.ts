export type PaymentMethod = 'cash' | 'bank';

export type OrderStatus = 'open' | 'completed' | 'cancelled';

/** Discount can be applied as percentage or fixed amount */
export type DiscountType = 'percent' | 'amount';
export interface DiscountInput {
  type: DiscountType;
  value: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Product {
  id: number;
  name: string;
  cat: string;
  price: number;
  is_active?: boolean;
  track_inventory?: boolean;
  stock_qty?: number | null;
  low_stock_threshold?: number | null;
}

export interface CartItem extends Product {
  qty: number;
}

export interface Order {
  id: string;
  time: string;
  items: string;
  pay: PaymentMethod;
  total: number;
  cust: number;
}

/** Order with table_number and status for table-based ordering and reports */
export interface OrderWithTable {
  table_number: string | null;
  status: OrderStatus;
}

export interface ReportKpi {
  ic: string;
  val: string;
  lbl: string;
  dl: string;
  dir: 'up' | 'dn' | 'fl';
}

export interface TopDish {
  n: string;
  cnt: number;
  rev: number;
}

export interface StaffUser {
  n: string;
  e: string;
  r: string;
  c: string;
  bg: string;
}

/** Raw material (ingredient) for inventory */
export type RawMaterialUnit = 'g' | 'kg' | 'pcs' | 'ml';

export interface RawMaterial {
  id: number;
  name: string;
  unit: RawMaterialUnit;
  stock_qty: number;
  low_stock_threshold: number | null;
  created_at?: string;
  updated_at?: string;
}

/** Link between dish (product) and raw material with quantity per serving */
export interface ProductIngredient {
  product_id: number;
  raw_material_id: number;
  quantity_per_serving: number;
}
