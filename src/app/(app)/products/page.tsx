'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { CATS, MENU } from '@/lib/constants';

const SOLD_MAP: Record<number, number> = {
  1: 6, 2: 9, 3: 5, 23: 7, 24: 8, 27: 11, 28: 14, 35: 3, 41: 2, 43: 4,
};

export default function ProductsPage() {
  const [search, setSearch] = useState('');

  const categoriesWithCount = CATS.filter((c) => c.id !== 'all').map((c) => ({
    ...c,
    count: MENU.filter((m) => m.cat === c.id).length,
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="shrink-0 border-b border-[#e4e0d8] bg-white px-5 py-3.5">
        <div>
          <h2 className="font-heading text-xl font-black leading-none mb-0.5">
            จัดการเมนู
          </h2>
          <p className="text-xs text-[#9a9288]">เพิ่ม แก้ไข และจัดหมวดหมู่เมนูอาหาร</p>
        </div>
      </div>
      <div className="shrink-0 flex gap-2 p-3 border-b border-[#e4e0d8] bg-white">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#9a9288]" />
          <input
            type="text"
            placeholder="ค้นหาเมนู..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#e4e0d8] rounded-lg py-2 px-2.5 pl-8 text-[#1a1816] text-[13px] focus:outline-none focus:border-[#d4800a]"
          />
        </div>
        <button
          type="button"
          className="py-2 px-3.5 rounded-lg border border-[#e4e0d8] bg-transparent text-[#9a9288] text-xs font-bold hover:border-[#1a1816] hover:text-[#1a1816] transition-colors whitespace-nowrap"
        >
          + หมวดหมู่
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-[#d4800a] border-none text-white text-xs font-extrabold cursor-pointer whitespace-nowrap hover:opacity-90"
        >
          + เพิ่มเมนู
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between my-3 mb-2">
          <span className="text-[10px] font-extrabold text-[#9a9288] uppercase tracking-wider">
            หมวดหมู่
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {categoriesWithCount.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 py-2 px-3 bg-white border border-[#e4e0d8] rounded-[10px] text-xs font-bold"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: c.color }}
              />
              <span>{c.name}</span>
              <span className="text-[11px] text-[#9a9288]">{c.count}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between my-3 mb-2">
          <span className="text-[10px] font-extrabold text-[#9a9288] uppercase tracking-wider">
            เมนูทั้งหมด
          </span>
        </div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                ชื่อเมนู
              </th>
              <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                หมวดหมู่
              </th>
              <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                ราคา
              </th>
              <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                ขายวันนี้
              </th>
              <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                เปิดใช้งาน
              </th>
              <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                {' '}
              </th>
            </tr>
          </thead>
          <tbody>
            {MENU.map((p) => {
              const cat = CATS.find((c) => c.id === p.cat);
              const sold = SOLD_MAP[p.id] ?? Math.floor(Math.random() * 8);
              return (
                <tr key={p.id} className="hover:bg-[#f7f5f0]">
                  <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white font-bold">
                    {p.name}
                  </td>
                  <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white">
                    <span className="text-[11px] py-0.5 px-2 rounded-md bg-[#f7f5f0] text-[#6b6358]">
                      {cat?.name ?? p.cat}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white font-extrabold text-[#d4800a] font-heading">
                    ฿{p.price}
                  </td>
                  <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white text-[11px] text-[#9a9288]">
                    {sold} จาน
                  </td>
                  <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white">
                    <button
                      type="button"
                      className="w-8 h-[18px] rounded-[9px] bg-[#16a34a] border-none cursor-pointer relative transition-colors"
                      aria-label="Toggle"
                    >
                      <span className="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform translate-x-3.5" />
                    </button>
                  </td>
                  <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white">
                    <button
                      type="button"
                      className="py-1 px-2.5 rounded-md border border-[#e4e0d8] bg-transparent text-[#9a9288] text-[11px] font-bold cursor-pointer hover:border-[#d4800a] hover:text-[#d4800a] transition-colors"
                    >
                      แก้ไข
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
