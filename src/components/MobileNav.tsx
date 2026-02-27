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

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e4e0d8] z-50 safe-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/pos' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all min-w-[60px] ${
                isActive
                  ? 'bg-[rgba(212,128,10,0.1)] text-[#d4800a]'
                  : 'bg-transparent text-[#9a9288] active:bg-[#f7f5f0]'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" strokeWidth={2} />
              <span className="text-[10px] font-bold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
