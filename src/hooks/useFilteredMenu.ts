import { useMemo } from 'react';
import type { Category, Product } from '@/types/pos';
import { CATS } from '@/lib/constants';

export function useFilteredMenu(
  menu: Product[],
  activeCat: string,
  search: string
): Product[] {
  return useMemo(() => {
    return menu.filter((p) => {
      const cOk = activeCat === 'all' || p.cat === activeCat;
      const sOk =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase());
      return cOk && sOk;
    });
  }, [menu, activeCat, search]);
}

export function getCatColor(catId: string, categories?: Category[]): string {
  const list = categories ?? CATS;
  return list.find((c) => c.id === catId)?.color ?? list[0]?.color ?? '#6b7280';
}
