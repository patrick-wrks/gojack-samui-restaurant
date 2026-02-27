'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useCartStore } from '@/store/cart-store';

const DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

export function Topbar() {
  const router = useRouter();
  const { logout } = useAuth();
  const { todayRevenue, todayOrders } = useCartStore();
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(
        `${DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      );
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-[52px] bg-white border-b border-[#e4e0d8] flex items-center px-4 gap-3.5 shrink-0 shadow-[0_1px_0_#e4e0d8]">
      <div className="font-heading font-black text-lg text-[#1a1816]">
        ร้าน<span className="text-[#d4800a]">อาหาร</span>
      </div>
      <div className="w-px h-[18px] bg-[#e4e0d8]" />
      <div className="text-xs text-[#9a9288]">{time}</div>
      <div className="flex-1" />
      <div className="flex flex-col items-end">
        <span className="font-heading text-[15px] font-extrabold text-[#1a1816] leading-none">
          ฿{todayRevenue.toLocaleString()}
        </span>
        <span className="text-[9px] text-[#9a9288] uppercase tracking-wider">วันนี้</span>
      </div>
      <div className="w-px h-[18px] bg-[#e4e0d8]" />
      <div className="flex flex-col items-end">
        <span className="font-heading text-[15px] font-extrabold text-[#1a1816] leading-none">
          {todayOrders}
        </span>
        <span className="text-[9px] text-[#9a9288] uppercase tracking-wider">ออเดอร์</span>
      </div>
      <div className="w-px h-[18px] bg-[#e4e0d8]" />
      <button
        type="button"
        onClick={() => router.push('/settings')}
        className="flex items-center gap-1.5 bg-[#f7f5f0] py-1.5 pl-1.5 pr-2.5 rounded-[20px] border border-[#e4e0d8]"
      >
        <div className="w-[26px] h-[26px] bg-[#d4800a] rounded-full flex items-center justify-center text-[11px] font-bold text-white font-heading">
          A
        </div>
        <span className="text-xs font-semibold">Admin</span>
      </button>
      <button
        type="button"
        onClick={() => {
          logout();
          router.push('/');
        }}
        className="border border-[#e4e0d8] rounded-[7px] py-1.5 px-2.5 text-[11px] text-[#9a9288] cursor-pointer hover:border-[#dc2626] hover:text-[#dc2626] transition-colors"
      >
        ออกจากระบบ
      </button>
    </header>
  );
}
