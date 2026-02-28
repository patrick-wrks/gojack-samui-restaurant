'use client';

import { useState } from 'react';
import { ShoppingCart, ChevronUp } from 'lucide-react';
import { MenuGrid } from '@/components/MenuGrid';
import { Cart } from '@/components/Cart';
import { CartDrawer } from '@/components/CartDrawer';
import { useCartStore } from '@/store/cart-store';
import { useCartTotals } from '@/hooks/useCartTotals';
import { useCurrencySymbol } from '@/store/store-settings-store';
import { cn } from '@/lib/utils';

export default function PosPage() {
  const [cartMode, setCartMode] = useState<'closed' | 'peek' | 'open'>('peek');
  const { cart } = useCartStore();
  const { total } = useCartTotals(cart, 0);
  const currency = useCurrencySymbol();
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#f8f6f2]">
      {/* Menu Grid - takes full width on mobile, shares on desktop */}
      <main className="flex-1 min-w-0 overflow-hidden">
        <MenuGrid cartPeekMode={cartMode === 'peek'} />
      </main>

      {/* Desktop Cart - hidden on mobile */}
      <aside className="hidden md:block shrink-0">
        <Cart />
      </aside>

      {/* Mobile Cart Drawer */}
      <CartDrawer
        open={cartMode === 'open'}
        onClose={() => setCartMode('peek')}
      />

      {/* Mobile Cart Peek Bar */}
      <div
        className={cn(
          'md:hidden fixed left-0 right-0 z-40 transition-transform duration-300',
          cartMode === 'open' ? 'translate-y-full' : 'translate-y-0'
        )}
        style={{ bottom: '72px' }}
      >
        {cartMode === 'peek' && (
          <button
            type="button"
            onClick={() => setCartMode('open')}
            className="w-full flex items-center justify-between gap-4 px-4 py-3 bg-white border-t border-[#e4e0d8] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] active:bg-[#f7f5f0]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#FA3E3E] flex items-center justify-center shrink-0">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 text-left">
                <div className="text-sm font-semibold text-[#1a1816]">
                  {itemCount > 0 ? `${itemCount} รายการ` : 'ตะกร้าว่าง'}
                </div>
                <div className="text-xs text-[#9a9288]">
                  แตะเพื่อดูตะกร้า
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-lg font-bold text-green-600 font-heading tabular-nums">
                {currency}{total.toLocaleString()}
              </span>
              <ChevronUp className="w-5 h-5 text-[#9a9288]" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
