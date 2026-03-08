import { create } from 'zustand';
import type { CartItem, PaymentMethod } from '@/types/pos';
import { useMenuStore } from '@/store/menu-store';
import { getNextOrderNumber, fetchTodayStats } from '@/lib/orders';

export interface CartStore {
  cart: CartItem[];
  payType: PaymentMethod;
  discount: number;
  orderNum: number;
  todayRevenue: number;
  todayOrders: number;
  orderNote: string;
  addItem: (productId: number) => void;
  updateQty: (productId: number, delta: number) => void;
  clearCart: () => void;
  setDiscount: (amount: number) => void;
  setOrderNote: (note: string) => void;
  setPayType: (method: PaymentMethod) => void;
  incrementOrderNum: () => void;
  addTodayOrder: (total: number) => void;
  initOrderNum: () => Promise<void>;
  refreshTodayStats: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  payType: 'cash',
  discount: 0,
  orderNum: 1,
  todayRevenue: 0,
  todayOrders: 0,
  orderNote: '',

  addItem: (productId) => {
    const product = useMenuStore.getState().products.find((p) => p.id === productId);
    if (!product) return;
    set((state) => {
      const existing = state.cart.find((c) => c.id === productId);
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.id === productId ? { ...c, qty: c.qty + 1 } : c
          ),
        };
      }
      return { cart: [...state.cart, { ...product, qty: 1 }] };
    });
  },

  updateQty: (productId, delta) => {
    set((state) => {
      const item = state.cart.find((c) => c.id === productId);
      if (!item) return state;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        return { cart: state.cart.filter((c) => c.id !== productId) };
      }
      return {
        cart: state.cart.map((c) =>
          c.id === productId ? { ...c, qty: newQty } : c
        ),
      };
    });
  },

  clearCart: () => set({ cart: [], discount: 0, orderNote: '' }),

  setDiscount: (amount) => set({ discount: amount }),

  setOrderNote: (note) => set({ orderNote: note }),

  setPayType: (payType) => set({ payType }),

  incrementOrderNum: () => set((s) => ({ orderNum: s.orderNum + 1 })),

  addTodayOrder: (total) =>
    set((s) => ({
      todayRevenue: s.todayRevenue + total,
      todayOrders: s.todayOrders + 1,
    })),

  initOrderNum: async () => {
    const nextNum = await getNextOrderNumber();
    set({ orderNum: nextNum });
  },

  refreshTodayStats: async () => {
    const stats = await fetchTodayStats();
    set({ todayRevenue: stats.revenue, todayOrders: stats.orders });
  },
}));
