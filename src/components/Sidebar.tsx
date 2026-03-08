'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, LayoutGrid, BarChart3, UtensilsCrossed, Settings, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/providers';
import { ROLE_ROUTES } from '@/lib/roles';
import { cn } from '@/lib/utils';

const allNavItems = [
  { href: '/pos', label: 'POS', icon: ShoppingCart },
  { href: '/tables', label: 'โต๊ะ', icon: LayoutGrid },
  { href: '/reports', label: 'รายงาน', icon: BarChart3 },
  { href: '/products', label: 'เมนู', icon: UtensilsCrossed },
  { href: '/raw-materials', label: 'วัตถุดิบ', icon: Package },
  { href: '/settings', label: 'ตั้งค่า', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const allowedRoutes = ROLE_ROUTES[role] ?? [];
  const navItems = allNavItems.filter((item) => allowedRoutes.includes(item.href));

  return (
    <aside className="w-14 bg-white border-r border-[#e4e0d8] flex flex-col items-center py-2 gap-0.5 shrink-0">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/pos' && pathname.startsWith(href));
        return (
          <Button
            key={href}
            variant="ghost"
            size="icon"
            asChild
            className={cn(
              "w-11 h-11 rounded-[11px] flex flex-col items-center justify-center gap-0.5 h-auto min-w-0 overflow-hidden",
              isActive
                ? 'bg-[rgba(250,62,62,0.1)] text-[#FA3E3E] hover:bg-[rgba(250,62,62,0.15)] hover:text-[#FA3E3E]'
                : 'bg-transparent text-[#9a9288] hover:bg-white hover:text-[#1a1816]'
            )}
          >
            <Link href={href} className="flex flex-col items-center justify-center gap-0.5 min-w-0 w-full overflow-hidden">
              <Icon className="w-[17px] h-[17px] shrink-0" strokeWidth={2} />
              <span className="text-[8px] font-bold uppercase tracking-wide text-truncate-safe max-w-full block">{label}</span>
            </Link>
          </Button>
        );
      })}
      <div className="flex-1" />
    </aside>
  );
}
