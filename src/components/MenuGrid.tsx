'use client';

import { useState } from 'react';
import { Search, Check, Plus, Minus } from 'lucide-react';
import { useFilteredMenu, getCatColor } from '@/hooks/useFilteredMenu';
import { useCartStore } from '@/store/cart-store';
import { useMenuStore, getCategoriesForUI } from '@/store/menu-store';
import { useCurrencySymbol } from '@/store/store-settings-store';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Product } from '@/types/pos';
import { cn } from '@/lib/utils';

function ProductCard({ 
  product, 
  onAdd, 
  currency, 
  isRecentlyAdded,
  quantity = 0
}: { 
  product: Product; 
  onAdd: () => void; 
  currency: string;
  isRecentlyAdded?: boolean;
  quantity?: number;
}) {
  const categories = getCategoriesForUI();
  const color = getCatColor(product.cat, categories);
  const categoryName = categories.find((c) => c.id === product.cat)?.name ?? product.cat;
  const hasQuantity = quantity > 0;
  
  return (
    <button
      type="button"
      onClick={onAdd}
      className={cn(
        // Compact height for 2-column mobile layout
        'h-[100px] sm:h-[120px]',
        // Flex layout for content distribution
        'flex flex-col justify-between',
        // Visual styling - full width of grid cell
        'w-full bg-white rounded-xl border-2',
        'p-3 sm:p-4',
        'shadow-[0_2px_6px_rgba(0,0,0,0.04)]',
        'transition-all duration-200 ease-out',
        'hover:border-[#FA3E3E] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
        'active:scale-[0.97] active:shadow-inner',
        'text-left cursor-pointer touch-target relative overflow-hidden',
        isRecentlyAdded && 'border-green-500 bg-green-50/30',
        hasQuantity && !isRecentlyAdded && 'border-[#FA3E3E]/30 bg-[#FA3E3E]/5'
      )}
    >
      {/* Success overlay for recently added */}
      {isRecentlyAdded && (
        <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center animate-[fadeOut_.5s_ease-out_forwards]">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg animate-[scaleIn_.3s_ease-out]">
            <Check className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      )}
      
      {/* Quantity badge - top left (shows if already in order) */}
      {hasQuantity && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-0.5 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-[#FA3E3E] text-white rounded-full text-[10px] sm:text-xs font-bold shadow-md">
          <span>{quantity}</span>
          <span className="hidden sm:inline text-[10px] opacity-90">ในออเดอร์</span>
        </div>
      )}
      
      {/* Add button hint */}
      <div className={cn(
        "absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200",
        hasQuantity 
          ? "bg-[#FA3E3E] text-white shadow-md" 
          : "bg-[#f2f0eb] hover:bg-[#FA3E3E] hover:text-white text-[#9a9288]"
      )}>
        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>
      
      {/* Main content area */}
      <div className={cn(
        "flex flex-col gap-1 pr-6",
        hasQuantity && "pt-5" // Add padding when badge is shown
      )}>
        {/* Product name - 2 lines max, smaller on mobile */}
        <h3 className="text-xs sm:text-sm font-semibold text-[#1a1816] leading-tight line-clamp-2-safe">
          {product.name}
        </h3>
        
        {/* Category name – colored text + 10% opacity background */}
        <span
          className="text-[10px] sm:text-xs font-medium truncate rounded-md px-1.5 py-0.5 w-fit"
          style={{ color, backgroundColor: `${color}1a` }}
        >
          {categoryName}
        </span>
      </div>
      
      {/* Price - always at bottom */}
      <span className="text-sm sm:text-base font-bold text-[#1a1816] font-heading tabular-nums">
        {currency}{product.price.toLocaleString()}
      </span>
    </button>
  );
}

interface MenuGridProps {
  cartPeekMode?: boolean;
  /** When set, product cards call this instead of adding to cart (e.g. table order flow). */
  onAddProduct?: (product: Product) => void;
  /** Product IDs to highlight as recently added */
  highlightRecent?: (string | number)[];
  /** Map of product names to quantities currently in order */
  productQuantities?: Record<string, number>;
}

export function MenuGrid({ 
  cartPeekMode = false, 
  onAddProduct, 
  highlightRecent = [],
  productQuantities = {}
}: MenuGridProps) {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const categories = getCategoriesForUI();
  const products = useMenuStore((s) => s.products);
  const loading = useMenuStore((s) => s.loading);
  const currency = useCurrencySymbol();
  const filtered = useFilteredMenu(products, activeCat, search);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f8f6f2]">
      {/* Header - Categories + Search */}
      <div className="shrink-0 px-3 sm:px-4 pt-3 sm:pt-4 pb-3 space-y-3 bg-white border-b border-[#e4e0d8]">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide momentum-scroll pb-1">
          <ToggleGroup
            type="single"
            value={activeCat}
            onValueChange={(v) => v && setActiveCat(v)}
            className="flex w-fit gap-2"
            spacing={0}
          >
            {categories.map((c) => (
              <ToggleGroupItem
                key={c.id}
                value={c.id}
                className={cn(
                  'px-3.5 sm:px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap',
                  'border-2 transition-all duration-200 touch-target h-auto',
                  'data-[state=off]:border-[#e4e0d8] data-[state=off]:bg-white data-[state=off]:text-[#6b6358]',
                  'data-[state=off]:hover:border-[#FA3E3E] data-[state=off]:hover:text-[#1a1816]',
                  'data-[state=on]:bg-[#FA3E3E] data-[state=on]:border-[#FA3E3E] data-[state=on]:text-white',
                  'active:scale-95'
                )}
              >
                {c.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9288] pointer-events-none" />
          <Input
            type="text"
            placeholder="ค้นหาเมนู..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-[#f8f6f2] border-[#e4e0d8] rounded-xl text-sm text-[#1a1816] placeholder:text-[#9a9288] focus:border-[#FA3E3E] focus:ring-2 focus:ring-[#FA3E3E]/10"
          />
        </div>
      </div>

      {/* Product grid - row height matches card so all categories look even (no big/squeezed cells) */}
      <div
        className={cn(
          // Scrollable area
          'flex-1 overflow-y-auto overflow-x-hidden momentum-scroll',
          // Container with consistent padding
          'px-3 sm:px-4 py-4 sm:py-4',
          // Grid: 2 cols on mobile, more on desktop
          'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          // Fixed row height = card height so every item same size (mobile 100px, sm+ 120px)
          'auto-rows-[100px] sm:auto-rows-[120px]',
          // Generous gaps to prevent cards from touching
          'gap-3 sm:gap-4',
          // Bottom padding for mobile cart
          cartPeekMode ? 'pb-32' : 'pb-6'
        )}
      >
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-[#9a9288]">
            <div className="w-12 h-12 rounded-full border-4 border-[#e4e0d8] border-t-[#FA3E3E] animate-spin mb-4" />
            <p className="text-sm">กำลังโหลดเมนู...</p>
          </div>
        ) : filtered.length > 0 ? (
          // Cards directly in grid - no wrapper divs
          filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAdd={() => (onAddProduct ? onAddProduct(p) : addItem(p.id))}
              currency={currency}
              isRecentlyAdded={highlightRecent.includes(String(p.id)) || highlightRecent.includes(p.id as unknown as string)}
              quantity={productQuantities[p.name] || 0}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-[#9a9288]">
            <div className="w-16 h-16 rounded-full bg-[#f2f0eb] flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-[#9a9288]" />
            </div>
            <p className="text-sm font-medium">ไม่พบเมนูที่ค้นหา</p>
            <p className="text-xs mt-1">ลองค้นหาด้วยคำอื่น</p>
          </div>
        )}
      </div>
    </div>
  );
}
