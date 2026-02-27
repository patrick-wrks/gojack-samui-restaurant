'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { MENU } from '@/lib/constants';
import { useFilteredMenu, getCatColor } from '@/hooks/useFilteredMenu';
import { useCartStore } from '@/store/cart-store';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Product } from '@/types/pos';
import { cn } from '@/lib/utils';

const CATS = [
  { id: 'all', name: 'ทั้งหมด' },
  { id: 'krapow', name: 'กระเพรา' },
  { id: 'curry', name: 'เครื่องแกง' },
  { id: 'stir', name: 'ผัดต่างๆ' },
  { id: 'rice', name: 'ข้าวผัด/ราดหน้า' },
  { id: 'somtam', name: 'ส้มตำ/ยำ' },
  { id: 'soup', name: 'แกงส้ม/ต้ม' },
  { id: 'seafood', name: 'ทะเล/ปลา' },
  { id: 'special', name: 'พิเศษ' },
  { id: 'side', name: 'ของเพิ่ม' },
];

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const color = getCatColor(product.cat);
  return (
    <button
      type="button"
      onClick={onAdd}
      className="bg-white border border-[#e4e0d8] rounded-[14px] p-3.5 md:p-3 cursor-pointer transition-all no-select relative text-left touch-target min-h-[90px] md:min-h-[80px] block w-full shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#d4800a] hover:bg-[#f7f5f0] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:scale-[0.97]"
    >
      <div
        className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full"
        style={{ background: color }}
      />
      <div className="text-sm md:text-xs font-bold leading-snug mb-2 text-[#1a1816] pr-4 line-clamp-2">
        {product.name}
      </div>
      <div className="font-heading text-base md:text-[15px] font-extrabold text-[#d4800a] mt-auto">
        ฿{product.price.toLocaleString()}
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
  const filtered = useFilteredMenu(MENU, activeCat, search);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Category Pills - Horizontal Scroll */}
      <div className="flex gap-2.5 px-3 md:px-3.5 py-3 md:py-2.5 overflow-x-auto shrink-0 scrollbar-hide momentum-scroll">
        <ToggleGroup
          type="single"
          value={activeCat}
          onValueChange={(v) => v && setActiveCat(v)}
          className="flex w-fit gap-2.5"
          spacing={0}
        >
          {CATS.map((c) => (
            <ToggleGroupItem
              key={c.id}
              value={c.id}
              className={cn(
                "px-4 md:px-3 py-2.5 md:py-1.5 rounded-full text-sm md:text-xs font-bold whitespace-nowrap border font-sans transition-all touch-target h-auto",
                "data-[state=off]:border-[#e4e0d8] data-[state=off]:bg-white data-[state=off]:text-[#9a9288] data-[state=off]:active:border-[#d4800a] data-[state=off]:active:text-[#1a1816]",
                "data-[state=on]:bg-[#d4800a] data-[state=on]:border-[#d4800a] data-[state=on]:text-black data-[state=on]:shadow-sm"
              )}
            >
              {c.name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Search Bar */}
      <div className="px-3 md:px-3.5 pb-3 md:pb-2 shrink-0 relative">
        <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-5 md:w-3 h-5 md:h-3 text-[#9a9288] pointer-events-none" />
        <Input
          type="text"
          placeholder="ค้นหาเมนู..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "w-full bg-white border-[#e4e0d8] rounded-xl md:rounded-[9px]",
            "py-3.5 md:py-2 px-4 pl-11 md:pl-8 text-[#1a1816] text-base md:text-[13px]",
            "placeholder:text-[#9a9288] touch-target focus:border-[#d4800a]"
          )}
        />
      </div>

      {/* Product Grid - Responsive columns */}
      {/* pb-32 for mobile when cart peek is visible, pb-20 when closed, pb-3.5 for desktop */}
      <div className={cn(
        "flex-1 overflow-y-auto px-3 md:px-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-2.5 md:gap-2 align-content-start momentum-scroll",
        cartPeekMode ? 'pb-36' : 'pb-24 md:pb-3.5'
      )}>
        {filtered.length > 0 ? (
          filtered.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={() => addItem(p.id)} />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-[#9a9288] text-base md:text-sm">
            ไม่พบเมนูที่ค้นหา
          </div>
        )}
      </div>
    </div>
  );
}
