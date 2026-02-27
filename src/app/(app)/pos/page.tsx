'use client';

import { useState } from 'react';
import { ShoppingCart, ChevronUp } from 'lucide-react';
import { MenuGrid } from '@/components/MenuGrid';
import { Cart } from '@/components/Cart';
import { CartDrawer } from '@/components/CartDrawer';
import { useCartStore } from '@/store/cart-store';
import { useCartTotals } from '@/hooks/useCartTotals';

export default function PosPage() {
  const [cartMode, setCartMode] = useState<'closed' | 'peek' | 'open'>('peek');
  const { cart } = useCartStore();
  const { total } = useCartTotals(cart, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="flex flex-1 flex-row overflow-hidden">
      {/* Menu Grid - takes full width on mobile, shares on desktop */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <MenuGrid cartPeekMode={cartMode === 'peek'} />
      </div>

      {/* Desktop Cart - hidden on mobile */}
      <div className="hidden md:block">
        <Cart />
      </div>

      {/* Mobile Cart Drawer - Full Screen Mode */}
      <CartDrawer
        open={cartMode === 'open'}
        onClose={() => setCartMode('peek')}
      />

      {/* Mobile Cart Peek Bar - Always visible summary */}
      <div
        className={`md:hidden fixed left-0 right-0 z-40 bg-white border-t border-[#e4e0d8] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-bottom transition-transform duration-300 ${
          cartMode === 'open' ? 'translate-y-full' : 'translate-y-0'
        }`}
        style={{ bottom: '72px' }} // Position above bottom nav
      >
        {/* Peek Mode - Collapsed Summary */}
        {cartMode === 'peek' && (
          <div
            onClick={() => setCartMode('open')}
            className="flex items-center justify-between gap-3 px-4 py-3 active:bg-[#f7f5f0] cursor-pointer touch-target min-w-0 overflow-hidden"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
              <div className="w-10 h-10 bg-[#d4800a] rounded-full flex items-center justify-center shrink-0">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 overflow-hidden">
                <div className="text-sm font-bold text-[#1a1816] text-truncate-safe">
                  {itemCount > 0 ? `${itemCount} รายการ` : 'ไม่มีรายการ'}
                </div>
                <div className="text-xs text-[#9a9288] text-truncate-safe">
                  แตะเพื่อดูตะกร้า
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 min-w-0 overflow-hidden">
              <div className="text-right min-w-0 overflow-hidden">
                <div className="text-lg font-extrabold text-[#d4800a] font-heading text-truncate-safe">
                  ฿{total.toLocaleString()}
                </div>
              </div>
              <ChevronUp className="w-5 h-5 text-[#9a9288] shrink-0" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
