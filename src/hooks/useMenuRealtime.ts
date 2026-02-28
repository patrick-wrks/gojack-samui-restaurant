'use client';

import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useMenuStore } from '@/store/menu-store';

/**
 * Subscribes to products and categories table changes so when any user
 * updates the menu (name, price, category, active), all other clients
 * refetch and see the same centralized data.
 */
export function useMenuRealtime() {
  const loadMenu = useMenuStore((s) => s.loadMenu);
  const stableLoadMenu = useCallback(loadMenu, [loadMenu]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const channel = client
      .channel('menu-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          stableLoadMenu();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          stableLoadMenu();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [stableLoadMenu]);
}
