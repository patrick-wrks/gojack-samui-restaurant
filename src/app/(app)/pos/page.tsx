'use client';

import { useState } from 'react';
import { ShoppingCart, ChevronUp } from 'lucide-react';
import { MenuGrid } from '@/components/MenuGrid';
import { Cart } from '@/components/Cart';
import { CartDrawer } from '@/components/CartDrawer';
import { useCartStore } from '@/store/cart-store';
import { useCartTotals } from '@/hooks/useCartTotals';
import { useCurrencySymbol } from '@/store/store-settings-store';

export default function PosPage() {
  const [cartMode, setCartMode] = useState<'closed' | 'peek' | 'open'>('peek');
  const { cart } = useCartStore();
  const { total } = useCartTotals(cart, 0);
  const currency = useCurrencySymbol();
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="flex flex-1 flex-row overflow-hidden bg-[#f8f6f2]">
      {/* Menu area – primary surface with subtle elevation */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <MenuGrid cartPeekMode={cartMode === 'peek'} />
      </div>

      {/* Desktop Cart */}
      <div className="hidden md:block">
        <Cart />
      </div>

      <CartDrawer
        open={cartMode === 'open'}
        onClose={() => setCartMode('peek')}
      />

      {/* Mobile: minimal cart peek bar – tap to open full cart */}
      <div
        className={`md:hidden fixed left-0 right-0 z-40 transition-transform duration-300 ease-out ${
          cartMode === 'open' ? 'translate-y-full' : 'translate-y-0'
        }`}
        style={{ bottom: '72px' }}
      >
        {cartMode === 'peek' && (
          <button
            type="button"
            onClick={() => setCartMode('open')}
            className="w-full flex items-center justify-between gap-4 px-5 py-3.5 bg-white/95 backdrop-blur-md border-t border-[#e8e4de] shadow-[0_-2px_16px_rgba(0,0,0,0.06)] active:bg-[#f5f3ef] min-w-0 overflow-hidden touch-target"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-full bg-[#1a1816] flex items-center justify-center shrink-0">
                <ShoppingCart className="w-4 h-4 text-white" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 overflow-hidden text-left">
                <div className="text-[13px] font-semibold text-[#1a1816] text-truncate-safe">
                  {itemCount > 0 ? `${itemCount} รายการ` : 'ตะกร้าว่าง'}
                </div>
                <div className="text-[11px] text-[#6b6358] text-truncate-safe">
                  แตะเพื่อดูตะกร้า
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 min-w-0">
              <span className="text-lg font-bold text-[#1a1816] font-heading tabular-nums text-truncate-safe">
                {currency}{total.toLocaleString()}
              </span>
              <ChevronUp className="w-5 h-5 text-[#9a9288] shrink-0" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
