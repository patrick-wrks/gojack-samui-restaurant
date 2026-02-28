'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, BarChart3, UtensilsCrossed, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/pos', label: 'POS', icon: ShoppingCart },
  { href: '/reports', label: 'รายงาน', icon: BarChart3 },
  { href: '/products', label: 'เมนู', icon: UtensilsCrossed },
  { href: '/settings', label: 'ตั้งค่า', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e4e0d8] z-50 safe-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-center justify-around py-2 px-4 min-w-0">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/pos' && pathname.startsWith(href));
          return (
            <Button
              key={href}
              variant="ghost"
              asChild
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-xl h-auto min-w-0 flex-1 max-w-[25%] gap-1 overflow-hidden",
                isActive
                  ? 'bg-[rgba(250,62,62,0.1)] text-[#FA3E3E] hover:bg-[rgba(250,62,62,0.15)] hover:text-[#FA3E3E]'
                  : 'bg-transparent text-[#9a9288] hover:bg-[#f7f5f0] hover:text-[#9a9288]'
              )}
            >
              <Link href={href} className="flex flex-col items-center justify-center gap-1 min-w-0 w-full overflow-hidden">
                <Icon className="w-5 h-5 shrink-0" strokeWidth={2} />
                <span className="text-[10px] font-bold text-truncate-safe block max-w-full">{label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
