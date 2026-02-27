'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useCartStore } from '@/store/cart-store';
import { LogOut, Settings } from 'lucide-react';

const DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

export function Topbar() {
  const router = useRouter();
  const { logout } = useAuth();
  const { todayRevenue, todayOrders } = useCartStore();
  const [time, setTime] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
    <header className="h-[52px] bg-white border-b border-[#e4e0d8] flex items-center px-3 md:px-4 gap-2 md:gap-3.5 shrink-0 shadow-[0_1px_0_#e4e0d8] safe-top">
      {/* Logo */}
      <div className="font-heading font-black text-base md:text-lg text-[#1a1816] shrink-0">
        ร้าน<span className="text-[#d4800a]">อาหาร</span>
      </div>
      
      <div className="hidden sm:block w-px h-[18px] bg-[#e4e0d8]" />
      <div className="hidden sm:block text-xs text-[#9a9288]">{time}</div>
      
      <div className="flex-1" />
      
      {/* Stats - shown on larger screens */}
      <div className="hidden md:flex flex-col items-end">
        <span className="font-heading text-[15px] font-extrabold text-[#1a1816] leading-none">
          ฿{todayRevenue.toLocaleString()}
        </span>
        <span className="text-[9px] text-[#9a9288] uppercase tracking-wider">วันนี้</span>
      </div>
      <div className="hidden md:block w-px h-[18px] bg-[#e4e0d8]" />
      <div className="hidden md:flex flex-col items-end">
        <span className="font-heading text-[15px] font-extrabold text-[#1a1816] leading-none">
          {todayOrders}
        </span>
        <span className="text-[9px] text-[#9a9288] uppercase tracking-wider">ออเดอร์</span>
      </div>
      <div className="hidden md:block w-px h-[18px] bg-[#e4e0d8]" />
      
      {/* Desktop Admin Button */}
      <button
        type="button"
        onClick={() => router.push('/settings')}
        className="hidden md:flex items-center gap-1.5 bg-[#f7f5f0] py-1.5 pl-1.5 pr-2.5 rounded-[20px] border border-[#e4e0d8] hover:bg-[#e4e0d8] transition-colors"
      >
        <div className="w-[26px] h-[26px] bg-[#d4800a] rounded-full flex items-center justify-center text-[11px] font-bold text-white font-heading">
          A
        </div>
        <span className="text-xs font-semibold">Admin</span>
      </button>
      
      {/* Desktop Logout */}
      <button
        type="button"
        onClick={() => {
          logout();
          router.push('/');
        }}
        className="hidden md:block border border-[#e4e0d8] rounded-[7px] py-1.5 px-2.5 text-[11px] text-[#9a9288] cursor-pointer hover:border-[#dc2626] hover:text-[#dc2626] transition-colors"
      >
        ออกจากระบบ
      </button>
      
      {/* Mobile Menu Button */}
      <div className="md:hidden relative">
        <button
          type="button"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="flex items-center gap-1.5 bg-[#f7f5f0] py-1.5 pl-1.5 pr-2 rounded-[20px] border border-[#e4e0d8] active:bg-[#e4e0d8] transition-colors touch-target"
        >
          <div className="w-7 h-7 bg-[#d4800a] rounded-full flex items-center justify-center text-[10px] font-bold text-white font-heading">
            A
          </div>
          <Settings className="w-4 h-4 text-[#9a9288]" />
        </button>
        
        {/* Mobile Dropdown Menu */}
        {showMobileMenu && (
          <div className="absolute right-0 top-full mt-2 bg-white border border-[#e4e0d8] rounded-xl shadow-lg z-50 min-w-[160px] py-2 animate-[rise_.15s_ease]">
            <button
              type="button"
              onClick={() => {
                router.push('/settings');
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#1a1816] hover:bg-[#f7f5f0] transition-colors"
            >
              <Settings className="w-4 h-4" />
              ตั้งค่า
            </button>
            <div className="border-t border-[#e4e0d8] my-1" />
            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
