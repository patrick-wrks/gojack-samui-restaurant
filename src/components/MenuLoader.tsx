'use client';

import { useEffect } from 'react';
import { useMenuStore } from '@/store/menu-store';
import { useMenuRealtime } from '@/hooks/useMenuRealtime';

export function MenuLoader() {
  const loadMenu = useMenuStore((s) => s.loadMenu);
  useMenuRealtime();

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);
  return null;
}
