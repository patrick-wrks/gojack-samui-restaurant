import { useMemo } from 'react';
import type { CartItem } from '@/types/pos';

export function useCartTotals(
  cart: CartItem[],
  discount: number
): { subtotal: number; discountAmount: number; total: number } {
  return useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const discountAmount = Math.min(discount, subtotal);
    const total = subtotal - discountAmount;
    return { subtotal, discountAmount, total };
  }, [cart, discount]);
}
