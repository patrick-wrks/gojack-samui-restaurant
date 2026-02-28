'use client';

import { useEffect } from 'react';
import { useMenuStore } from '@/store/menu-store';

export function MenuLoader() {
  const loadMenu = useMenuStore((s) => s.loadMenu);
  useEffect(() => {
    loadMenu();
  }, [loadMenu]);
  return null;
}
