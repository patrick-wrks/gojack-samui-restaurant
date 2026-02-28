import { create } from 'zustand';
import type { Category, Product } from '@/types/pos';
import { CATS, MENU } from '@/lib/constants';
import { fetchCategories, fetchProducts } from '@/lib/menu';

interface MenuState {
  categories: Category[];
  products: Product[];
  loading: boolean;
  error: string | null;
  loadMenu: () => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  products: [],
  loading: false,
  error: null,

  loadMenu: async () => {
    set({ loading: true, error: null });
    try {
      const [categories, products] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
      ]);
      if (categories.length > 0 && products.length > 0) {
        set({ categories, products, error: null });
      } else {
        set({
          categories: CATS.filter((c) => c.id !== 'all'),
          products: MENU,
          error: null,
        });
      }
    } catch (e) {
      set({
        categories: CATS.filter((c) => c.id !== 'all'),
        products: MENU,
        error: e instanceof Error ? e.message : 'Failed to load menu',
      });
    } finally {
      set({ loading: false });
    }
  },
}));

/** Categories for UI: "all" + DB categories (for filter pills and getCatColor) */
export function getCategoriesForUI(): Category[] {
  const { categories } = useMenuStore.getState();
  const all: Category = { id: 'all', name: 'ทั้งหมด', color: '#f5a623' };
  return [all, ...categories];
}
