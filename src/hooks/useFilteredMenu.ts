import { useMemo } from 'react';
import type { Category, Product } from '@/types/pos';
import { CATS } from '@/lib/constants';

export function useFilteredMenu(
  menu: Product[],
  activeCat: string,
  search: string
): Product[] {
  return useMemo(() => {
    const filtered = menu.filter((p) => {
      const cOk = activeCat === 'all' || p.cat === activeCat;
      const sOk =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase());
      return cOk && sOk;
    });

    if (activeCat !== 'all') {
      return filtered;
    }

    // For "ทั้งหมด" (all) tab: group by category, then order categories by item count (most to least)
    const byCat = new Map<string, Product[]>();
    for (const p of filtered) {
      const list = byCat.get(p.cat) ?? [];
      list.push(p);
      byCat.set(p.cat, list);
    }
    const catIdsByCount = [...byCat.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([cat]) => cat);
    const result: Product[] = [];
    for (const catId of catIdsByCount) {
      result.push(...(byCat.get(catId) ?? []));
    }
    return result;
  }, [menu, activeCat, search]);
}

export function getCatColor(catId: string, categories?: Category[]): string {
  const list = categories ?? CATS;
  return list.find((c) => c.id === catId)?.color ?? list[0]?.color ?? '#6b7280';
}
