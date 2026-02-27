'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, BarChart3, UtensilsCrossed, Settings } from 'lucide-react';

const navItems = [
  { href: '/pos', label: 'POS', icon: ShoppingCart },
  { href: '/reports', label: 'รายงาน', icon: BarChart3 },
  { href: '/products', label: 'เมนู', icon: UtensilsCrossed },
  { href: '/settings', label: 'ตั้งค่า', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-14 bg-white border-r border-[#e4e0d8] flex flex-col items-center py-2 gap-0.5 shrink-0">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/pos' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`w-11 h-11 rounded-[11px] border-none flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
              isActive
                ? 'bg-[rgba(212,128,10,0.1)] text-[#d4800a]'
                : 'bg-transparent text-[#9a9288] hover:bg-[#ffffff] hover:text-[#1a1816]'
            }`}
          >
            <Icon className="w-[17px] h-[17px]" strokeWidth={2} />
            <span className="text-[8px] font-bold uppercase tracking-wide">{label}</span>
          </Link>
        );
      })}
      <div className="flex-1" />
    </aside>
  );
}
