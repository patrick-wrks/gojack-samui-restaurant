export type PaymentMethod = 'cash' | 'bank';

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
