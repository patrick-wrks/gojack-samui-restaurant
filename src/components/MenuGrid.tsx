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
        'group flex h-full min-h-[132px] sm:min-h-[128px] w-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#e8e4de] bg-white text-left no-select',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 cursor-pointer touch-target',
        'hover:border-[#d4cfc5] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5',
        'active:scale-[0.98] active:shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
        'p-3.5 md:p-3 relative'
      )}
    >
      {/* Category accent – left edge */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full shrink-0"
        style={{ background: color }}
      />
      <div className="flex min-h-0 flex-1 flex-col pl-2 gap-0.5">
        <div className="min-h-[2.5em] text-sm font-semibold leading-snug text-[#1a1816] line-clamp-2-safe md:text-xs overflow-hidden">
          {product.name}
        </div>
        <div className="text-[11px] text-[#6b6358] truncate md:text-[10px] shrink-0">
          {categoryName}
        </div>
        <div className="mt-auto shrink-0 pt-1.5 font-heading text-[15px] font-bold text-[#1a1816] md:text-sm tabular-nums">
          {currency}{product.price.toLocaleString()}
        </div>
      </div>
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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Section: Categories + Search – single header block */}
      <div className="shrink-0 px-4 md:px-5 pt-4 md:pt-5 pb-3 space-y-3">
        <div className="flex gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide momentum-scroll min-w-0 -mx-1 px-1">
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
                  'px-4 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap border font-sans transition-all duration-200 touch-target h-auto',
                  'data-[state=off]:border-transparent data-[state=off]:bg-[#eeebe6] data-[state=off]:text-[#6b6358] data-[state=off]:hover:bg-[#e8e4de] data-[state=off]:hover:text-[#1a1816]',
                  'data-[state=on]:bg-[#1a1816] data-[state=on]:border-[#1a1816] data-[state=on]:text-white data-[state=on]:shadow-sm'
                )}
              >
                {c.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9288] pointer-events-none shrink-0" />
          <Input
            type="text"
            placeholder="ค้นหาเมนู..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              'w-full bg-white border-[#e8e4de] rounded-lg h-10 pl-10 pr-3 text-[14px] text-[#1a1816]',
              'placeholder:text-[#9a9288] touch-target focus:border-[#1a1816] focus:ring-2 focus:ring-[#1a1816]/10'
            )}
          />
        </div>
      </div>

      {/* Product grid – fixed cell size so every tab shows same card dimensions */}
      <div
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-5 momentum-scroll min-w-0',
          'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
          'grid-auto-rows-[132px] sm:grid-auto-rows-[128px] gap-3 sm:gap-2.5 align-content-start',
          cartPeekMode ? 'pb-36' : 'pb-24 md:pb-5'
        )}
      >
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-[#6b6358] text-[14px]">
            <div className="w-8 h-8 rounded-full border-2 border-[#e8e4de] border-t-[#1a1816] animate-spin mb-3" />
            กำลังโหลดเมนู...
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={() => addItem(p.id)} currency={currency} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-[#6b6358] text-[14px]">
            ไม่พบเมนูที่ค้นหา
          </div>
        )}
      </div>
    </div>
  );
}
