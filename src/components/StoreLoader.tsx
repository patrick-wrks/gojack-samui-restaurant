'use client';

import { useEffect } from 'react';
import { useStoreSettingsStore } from '@/store/store-settings-store';
import { useStoreRealtime } from '@/hooks/useStoreRealtime';

export function StoreLoader() {
  const loadStore = useStoreSettingsStore((s) => s.loadStore);
  useStoreRealtime();

  useEffect(() => {
    loadStore();
  }, [loadStore]);
  return null;
}
