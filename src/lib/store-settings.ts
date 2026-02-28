import { supabase } from './supabase';

export interface StoreSettings {
  id: number;
  store_name: string;
  store_address: string;
  store_phone: string;
  currency_symbol: string;
  tax_rate: number;
  prices_include_tax: boolean;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
}

const DEFAULT_STORE: StoreSettings = {
  id: 1,
  store_name: 'ร้านอาหารครัวไทย',
  store_address: '',
  store_phone: '',
  currency_symbol: '฿',
  tax_rate: 7,
  prices_include_tax: true,
  bank_name: '',
  bank_account_number: '',
  bank_account_name: '',
};

export async function fetchStore(): Promise<StoreSettings> {
  if (!supabase) return DEFAULT_STORE;
  const { data, error } = await supabase
    .from('store')
    .select('*')
    .eq('id', 1)
    .single();
  if (error || !data) return DEFAULT_STORE;
  return {
    id: data.id,
    store_name: data.store_name ?? DEFAULT_STORE.store_name,
    store_address: data.store_address ?? '',
    store_phone: data.store_phone ?? '',
    currency_symbol: data.currency_symbol ?? '฿',
    tax_rate: Number(data.tax_rate) ?? 7,
    prices_include_tax: data.prices_include_tax ?? true,
    bank_name: data.bank_name ?? '',
    bank_account_number: data.bank_account_number ?? '',
    bank_account_name: data.bank_account_name ?? '',
  };
}

export async function updateStore(
  params: Partial<Omit<StoreSettings, 'id'>>
): Promise<StoreSettings | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('store')
    .update(params)
    .eq('id', 1)
    .select()
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    store_name: data.store_name ?? DEFAULT_STORE.store_name,
    store_address: data.store_address ?? '',
    store_phone: data.store_phone ?? '',
    currency_symbol: data.currency_symbol ?? '฿',
    tax_rate: Number(data.tax_rate) ?? 7,
    prices_include_tax: data.prices_include_tax ?? true,
    bank_name: data.bank_name ?? '',
    bank_account_number: data.bank_account_number ?? '',
    bank_account_name: data.bank_account_name ?? '',
  };
}
