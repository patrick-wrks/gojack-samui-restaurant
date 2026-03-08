import { useMemo } from 'react';
import type { CartItem, DiscountInput } from '@/types/pos';

/** Compute discount amount from subtotal and discount input (percent or amount) */
export function computeDiscountAmount(
  subtotal: number,
  discount: DiscountInput
): number {
  if (discount.value <= 0) return 0;
  const amount =
    discount.type === 'percent'
      ? (subtotal * discount.value) / 100
      : discount.value;
  return Math.min(amount, subtotal);
}

export function useCartTotals(
  cart: CartItem[],
  discount: DiscountInput
): { subtotal: number; discountAmount: number; total: number } {
  return useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const discountAmount = computeDiscountAmount(subtotal, discount);
    const total = subtotal - discountAmount;
    return { subtotal, discountAmount, total };
  }, [cart, discount]);
}
