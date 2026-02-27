'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useCartStore } from '@/store/cart-store';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    <header className="h-[52px] bg-white border-b border-[#e4e0d8] flex items-center px-3 md:px-4 gap-2 md:gap-3.5 shrink-0 shadow-[0_1px_0_#e4e0d8] safe-top min-w-0 overflow-hidden">
      {/* Logo */}
      <div className="font-heading font-black text-base md:text-lg text-[#1a1816] shrink-0 min-w-0 overflow-hidden text-truncate-safe">
        ร้าน<span className="text-[#d4800a]">อาหาร</span>
      </div>

      <Separator orientation="vertical" className="hidden sm:block h-[18px] bg-[#e4e0d8] shrink-0" />
      <div className="hidden sm:block text-xs text-[#9a9288] shrink-0 text-truncate-safe min-w-0">{time}</div>

      <div className="flex-1 min-w-0" />

      {/* Stats - shown on larger screens */}
      <div className="hidden md:flex flex-col items-end min-w-0 overflow-hidden">
        <span className="font-heading text-[15px] font-extrabold text-[#1a1816] leading-none text-truncate-safe max-w-full">
          ฿{todayRevenue.toLocaleString()}
        </span>
        <span className="text-[9px] text-[#9a9288] uppercase tracking-wider">วันนี้</span>
      </div>
      <Separator orientation="vertical" className="hidden md:block h-[18px] bg-[#e4e0d8] shrink-0" />
      <div className="hidden md:flex flex-col items-end min-w-0 overflow-hidden">
        <span className="font-heading text-[15px] font-extrabold text-[#1a1816] leading-none text-truncate-safe max-w-full">
          {todayOrders}
        </span>
        <span className="text-[9px] text-[#9a9288] uppercase tracking-wider">ออเดอร์</span>
      </div>
      <Separator orientation="vertical" className="hidden md:block h-[18px] bg-[#e4e0d8]" />

      {/* Desktop Admin Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/settings')}
        className="hidden md:flex items-center gap-1.5 bg-[#f7f5f0] hover:bg-[#e4e0d8] py-1.5 pl-1.5 pr-2.5 rounded-[20px] border border-[#e4e0d8] h-auto text-foreground"
      >
        <div className="w-[26px] h-[26px] bg-[#d4800a] rounded-full flex items-center justify-center text-[11px] font-bold text-white font-heading">
          A
        </div>
        <span className="text-xs font-semibold">Admin</span>
      </Button>

      {/* Desktop Logout */}
      <Button
        variant="ghost"
        onClick={() => {
          logout();
          router.push('/');
        }}
        className="hidden md:block border border-[#e4e0d8] rounded-[7px] py-1.5 px-2.5 h-auto text-[11px] text-[#9a9288] hover:border-[#dc2626] hover:text-[#dc2626]"
      >
        ออกจากระบบ
      </Button>

      {/* Mobile Menu Dropdown */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-1.5 bg-[#f7f5f0] hover:bg-[#e4e0d8] py-1.5 pl-1.5 pr-2 rounded-[20px] border border-[#e4e0d8] h-auto touch-target"
            >
              <div className="w-7 h-7 bg-[#d4800a] rounded-full flex items-center justify-center text-[10px] font-bold text-white font-heading">
                A
              </div>
              <Settings className="w-4 h-4 text-[#9a9288]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px] rounded-xl border-[#e4e0d8]">
            <DropdownMenuItem
              onClick={() => router.push('/settings')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1a1816] cursor-pointer rounded-lg focus:bg-[#f7f5f0]"
            >
              <Settings className="w-4 h-4" />
              ตั้งค่า
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#e4e0d8]" />
            <DropdownMenuItem
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#dc2626] cursor-pointer rounded-lg focus:bg-[#fef2f2]"
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
