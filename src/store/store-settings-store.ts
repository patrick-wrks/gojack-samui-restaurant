import { create } from 'zustand';
import type { StoreSettings } from '@/lib/store-settings';
import { fetchStore } from '@/lib/store-settings';

interface StoreSettingsState {
  store: StoreSettings | null;
  loading: boolean;
  loadStore: () => Promise<void>;
}

export const useStoreSettingsStore = create<StoreSettingsState>((set) => ({
  store: null,
  loading: false,

  loadStore: async () => {
    set({ loading: true });
    const store = await fetchStore();
    set({ store, loading: false });
  },
}));

export function useCurrencySymbol(): string {
  const store = useStoreSettingsStore((s) => s.store);
  return store?.currency_symbol ?? '฿';
}
