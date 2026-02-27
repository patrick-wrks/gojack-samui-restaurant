'use client';

import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Subscribe to orders table changes (insert/update) so the Reports page
 * can refresh when a new order is placed.
 */
export function useOrdersRealtime(onChange: () => void) {
  const stableOnChange = useCallback(onChange, [onChange]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const channel = client
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          stableOnChange();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [stableOnChange]);
}
