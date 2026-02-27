'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { MENU } from '@/lib/constants';
import { useFilteredMenu, getCatColor } from '@/hooks/useFilteredMenu';
import { useCartStore } from '@/store/cart-store';
import type { Product } from '@/types/pos';

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
      className="bg-white border border-[#e4e0d8] rounded-[14px] p-3 cursor-pointer transition-all user-select-none relative shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#d4800a] hover:bg-[#f7f5f0] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:scale-[0.97] text-left"
    >
      <div
        className="absolute top-2 right-2 w-[7px] h-[7px] rounded-full"
        style={{ background: color }}
      />
      <div className="text-xs font-bold leading-tight mb-1 text-[#1a1816] pr-3">
        {product.name}
      </div>
      <div className="font-heading text-[15px] font-extrabold text-[#d4800a]">
        ฿{product.price}
      </div>
    </button>
  );
}

export function MenuGrid() {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const filtered = useFilteredMenu(MENU, activeCat, search);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex gap-1.5 px-3.5 py-2.5 overflow-x-auto shrink-0 scrollbar-hide">
        {CATS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCat(c.id)}
            className={`px-3 py-1.5 rounded-[20px] text-xs font-bold whitespace-nowrap border font-sans transition-all cursor-pointer ${
              activeCat === c.id
                ? 'bg-[#d4800a] border-[#d4800a] text-black'
                : 'border-[#e4e0d8] bg-white text-[#9a9288] hover:border-[#d4800a] hover:text-[#1a1816]'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="px-3.5 pb-2 shrink-0 relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-3 h-3 text-[#9a9288] pointer-events-none" />
        <input
          type="text"
          placeholder="ค้นหาเมนู..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-[#e4e0d8] rounded-[9px] py-2 px-3 pl-8 text-[#1a1816] text-[13px] focus:outline-none focus:border-[#d4800a] placeholder:text-[#9a9288]"
        />
      </div>
      <div className="flex-1 overflow-y-auto px-3.5 pb-3.5 grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-2 align-content-start">
        {filtered.length > 0 ? (
          filtered.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={() => addItem(p.id)} />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-[#9a9288] text-sm">
            ไม่พบเมนูที่ค้นหา
          </div>
        )}
      </div>
    </div>
  );
}
