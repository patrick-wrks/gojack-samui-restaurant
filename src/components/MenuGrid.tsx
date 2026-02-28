'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useFilteredMenu, getCatColor } from '@/hooks/useFilteredMenu';
import { useCartStore } from '@/store/cart-store';
import { useMenuStore, getCategoriesForUI } from '@/store/menu-store';
import { useCurrencySymbol } from '@/store/store-settings-store';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Product } from '@/types/pos';
import { cn } from '@/lib/utils';

function ProductCard({ product, onAdd, currency }: { product: Product; onAdd: () => void; currency: string }) {
  const categories = getCategoriesForUI();
  const color = getCatColor(product.cat, categories);
  const categoryName = categories.find((c) => c.id === product.cat)?.name ?? product.cat;
  
  return (
    <button
      type="button"
      onClick={onAdd}
      className={cn(
        // Fixed height for consistency across all tabs
        'h-[120px] sm:h-[130px]',
        // Flex layout for content distribution
        'flex flex-col justify-between',
        // Visual styling
        'w-full bg-white rounded-xl border border-[#e4e0d8]',
        'p-3 sm:p-3.5',
        'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        'transition-all duration-200 ease-out',
        'hover:border-[#FA3E3E] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5',
        'active:scale-[0.98]',
        'text-left cursor-pointer touch-target'
      )}
    >
      {/* Category color indicator - top right */}
      <div
        className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      
      {/* Main content area */}
      <div className="flex flex-col gap-1 pr-4">
        {/* Product name - 2 lines max */}
        <h3 className="text-sm font-semibold text-[#1a1816] leading-snug line-clamp-2-safe">
          {product.name}
        </h3>
        
        {/* Category name */}
        <span className="text-xs text-[#9a9288] truncate">
          {categoryName}
        </span>
      </div>
      
      {/* Price - always at bottom */}
      <span className="text-base font-bold text-green-600 font-heading tabular-nums">
        {currency}{product.price.toLocaleString()}
      </span>
    </button>
  );
}

interface MenuGridProps {
  cartPeekMode?: boolean;
}

export function MenuGrid({ cartPeekMode = false }: MenuGridProps) {
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
      <div className="shrink-0 px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3 space-y-3 bg-white border-b border-[#e4e0d8]">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide momentum-scroll">
          <ToggleGroup
            type="single"
            value={activeCat}
            onValueChange={(v) => v && setActiveCat(v)}
            className="flex w-fit gap-1.5"
            spacing={0}
          >
            {categories.map((c) => (
              <ToggleGroupItem
                key={c.id}
                value={c.id}
                className={cn(
                  'px-3 sm:px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                  'border transition-all duration-200 touch-target h-auto',
                  'data-[state=off]:border-[#e4e0d8] data-[state=off]:bg-white data-[state=off]:text-[#6b6358]',
                  'data-[state=off]:hover:border-[#FA3E3E] data-[state=off]:hover:text-[#1a1816]',
                  'data-[state=on]:bg-[#FA3E3E] data-[state=on]:border-[#FA3E3E] data-[state=on]:text-white'
                )}
              >
                {c.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9288] pointer-events-none" />
          <Input
            type="text"
            placeholder="ค้นหาเมนู..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#f8f6f2] border-[#e4e0d8] rounded-lg text-sm text-[#1a1816] placeholder:text-[#9a9288] focus:border-[#FA3E3E] focus:ring-2 focus:ring-[#FA3E3E]/10"
          />
        </div>
      </div>

      {/* Product grid - CONSISTENT across all tabs */}
      <div
        className={cn(
          // Scrollable area
          'flex-1 overflow-y-auto overflow-x-hidden',
          // Consistent padding
          'px-3 sm:px-4 py-3 sm:py-4',
          // Grid: same columns on all screen sizes
          'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
          // Fixed row height for consistency (cards align perfectly)
          'grid-rows-[repeat(auto-fill,120px)] sm:grid-rows-[repeat(auto-fill,130px)]',
          // Consistent gap - this never changes
          'gap-3 sm:gap-4',
          // Align items to start (no stretching)
          'items-start content-start',
          // Bottom padding for mobile cart
          cartPeekMode ? 'pb-32' : 'pb-20'
        )}
      >
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-[#9a9288]">
            <div className="w-10 h-10 rounded-full border-3 border-[#e4e0d8] border-t-[#FA3E3E] animate-spin mb-4" />
            <p className="text-sm">กำลังโหลดเมนู...</p>
          </div>
        ) : filtered.length > 0 ? (
          // Cards directly in grid - no wrapper divs
          filtered.map((p) => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onAdd={() => addItem(p.id)} 
              currency={currency} 
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-[#9a9288]">
            <div className="w-16 h-16 rounded-full bg-[#f2f0eb] flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-[#9a9288]" />
            </div>
            <p className="text-sm">ไม่พบเมนูที่ค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
}
