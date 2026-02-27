'use client';

import { MenuGrid } from '@/components/MenuGrid';
import { Cart } from '@/components/Cart';

export default function PosPage() {
  return (
    <div className="flex flex-1 flex-row overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <MenuGrid />
      </div>
      <Cart />
    </div>
  );
}
