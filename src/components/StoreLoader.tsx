'use client';

import { useEffect } from 'react';
import { useStoreSettingsStore } from '@/store/store-settings-store';

export function StoreLoader() {
  const loadStore = useStoreSettingsStore((s) => s.loadStore);
  useEffect(() => {
    loadStore();
  }, [loadStore]);
  return null;
}
