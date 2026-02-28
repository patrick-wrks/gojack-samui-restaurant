'use client';

import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useStoreSettingsStore } from '@/store/store-settings-store';

/**
 * Subscribes to store table changes so when any user
 * updates the store settings (name, address, phone, bank info, tax settings),
 * all other clients refetch and see the same centralized data.
 */
export function useStoreRealtime() {
  const loadStore = useStoreSettingsStore((s) => s.loadStore);
  const stableLoadStore = useCallback(loadStore, [loadStore]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const channel = client
      .channel('store-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store' },
        () => {
          stableLoadStore();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [stableLoadStore]);
}
