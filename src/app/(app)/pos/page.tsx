'use client';

import { useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { MenuGrid } from '@/components/MenuGrid';
import { Cart } from '@/components/Cart';
import { CartDrawer } from '@/components/CartDrawer';
import { useCartStore } from '@/store/cart-store';
import { useCartTotals } from '@/hooks/useCartTotals';

export default function PosPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const { cart, todayRevenue, todayOrders } = useCartStore();
  const { total } = useCartTotals(cart, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="flex flex-1 flex-row overflow-hidden">
      {/* Menu Grid - takes full width on mobile, shares on desktop */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <MenuGrid />
      </div>
      
      {/* Desktop Cart - hidden on mobile */}
      <div className="hidden md:block">
        <Cart />
      </div>
      
      {/* Mobile Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      
      {/* Mobile Floating Cart Button */}
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 bg-[#d4800a] text-white rounded-full p-4 shadow-lg flex items-center gap-2 animate-[rise_.2s_ease] touch-target"
        style={{ animation: itemCount > 0 ? 'none' : undefined }}
      >
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span className="bg-white text-[#d4800a] text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
            {itemCount}
          </span>
        )}
      </button>
    </div>
  );
}
