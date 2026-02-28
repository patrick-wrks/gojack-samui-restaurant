'use client';

import { useState, useRef } from 'react';
import { ChevronDown, Trash2, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useCartTotals } from '@/hooks/useCartTotals';
import { useCurrencySymbol } from '@/store/store-settings-store';
import { insertOrder } from '@/lib/orders';
import { PaymentModal } from './PaymentModal';
import type { PaymentMethod } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const {
    cart,
    payType,
    orderNum,
    discount,
    setDiscount,
    clearCart,
    incrementOrderNum,
    addTodayOrder,
  } = useCartStore();
  const { subtotal, discountAmount, total } = useCartTotals(cart, discount);
  const currency = useCurrencySymbol();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const [translateY, setTranslateY] = useState(0);

  const handleAddDiscount = () => {
    const v = window.prompt(`ส่วนลด (${currency}):`);
    if (v != null && !Number.isNaN(Number(v)) && Number(v) >= 0) {
      setDiscount(Number(v));
    }
  };

  const handleConfirmOrder = async (method: PaymentMethod) => {
    const nextOrderNum = orderNum + 1;
    await insertOrder({
      orderNumber: nextOrderNum,
      total,
      paymentMethod: method,
      items: cart,
    });
    addTodayOrder(total);
    incrementOrderNum();
    clearCart();
    onClose();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) setTranslateY(diff);
  };

  const handleTouchEnd = () => {
    if (translateY > 100) onClose();
    setTranslateY(0);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="md:hidden fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-2xl flex flex-col"
        style={{
          height: 'calc(100vh - 80px)',
          transform: `translateY(${translateY}px)`,
          transition: translateY === 0 ? 'transform 0.25s ease-out' : 'none',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-[#e4e0d8]" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-[#e4e0d8] flex items-center justify-between bg-[#faf9f7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d4800a] flex items-center justify-center text-white text-lg">
              🛒
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-[#1a1816]">
                ออเดอร์ปัจจุบัน
              </h3>
              <span className="text-xs text-[#9a9288]">
                #{orderNum} · {cart.reduce((sum, i) => sum + i.qty, 0)} รายการ
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f2f0eb] text-[#6b6358] hover:bg-[#e4e0d8]"
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-[#f2f0eb] flex items-center justify-center text-3xl">
                🛒
              </div>
              <p className="text-sm text-[#9a9288]">แตะเมนูเพื่อเพิ่มออเดอร์</p>
              <Button
                onClick={onClose}
                className="bg-[#d4800a] hover:bg-[#c47000] text-white rounded-lg text-sm font-semibold px-5 py-2.5"
              >
                ไปเลือกเมนู
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <CartLineItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-[#e4e0d8] bg-[#faf9f7]">
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              onClick={clearCart}
              className="flex-1 py-2.5 h-auto rounded-lg border-[#e4e0d8] bg-white text-[#6b6358] text-sm font-semibold hover:bg-[#f2f0eb] flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              ล้าง
            </Button>
            <Button
              variant="outline"
              onClick={handleAddDiscount}
              className="flex-1 py-2.5 h-auto rounded-lg border-[#e4e0d8] bg-white text-[#6b6358] text-sm font-semibold hover:bg-[#f2f0eb] flex items-center justify-center gap-2"
            >
              <Tag className="w-4 h-4" />
              ส่วนลด
            </Button>
          </div>

          <div className="mb-3 space-y-1.5 py-2 border-y border-[#e4e0d8]">
            <div className="flex justify-between items-center text-sm text-[#6b6358]">
              <span>ยอดรวม</span>
              <span className="text-[#1a1816] font-medium tabular-nums">
                {currency}{subtotal.toLocaleString()}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#6b6358]">ส่วนลด</span>
                <span className="text-green-600 font-medium tabular-nums">
                  –{currency}{discountAmount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-[#e4e0d8]">
              <span className="text-base font-bold text-[#1a1816]">รวมทั้งสิ้น</span>
              <span className="text-xl font-bold text-[#d4800a] font-heading tabular-nums">
                {currency}{total.toLocaleString()}
              </span>
            </div>
          </div>

          <Button
            onClick={() => cart.length > 0 && setPaymentOpen(true)}
            disabled={cart.length === 0}
            className={cn(
              'w-full rounded-lg py-4 h-auto text-base font-bold font-heading',
              'bg-green-600 text-white hover:bg-green-700',
              'disabled:bg-[#e4e0d8] disabled:text-[#9a9288]'
            )}
          >
            ยืนยันออเดอร์ — {currency}{total.toLocaleString()}
          </Button>
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        total={total}
        payType={payType}
        orderNum={orderNum}
        onConfirm={handleConfirmOrder}
      />
    </>
  );
}

function CartLineItem({
  item,
}: {
  item: { id: number; name: string; price: number; qty: number };
}) {
  const updateQty = useCartStore((s) => s.updateQty);
  const currency = useCurrencySymbol();

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f8f6f2] border border-[#e4e0d8]">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#1a1816] truncate">
          {item.name}
        </div>
        <div className="text-xs text-[#9a9288]">
          {currency}{item.price} × {item.qty} ={' '}
          <span className="font-semibold text-[#1a1816]">
            {currency}{(item.price * item.qty).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQty(item.id, -1)}
          className="w-9 h-9 rounded-lg border-[#e4e0d8] bg-white text-[#1a1816] hover:border-[#d4800a] hover:text-[#d4800a]"
        >
          −
        </Button>
        <span className="text-base font-bold w-5 text-center font-heading">
          {item.qty}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQty(item.id, 1)}
          className="w-9 h-9 rounded-lg border-[#e4e0d8] bg-white text-[#1a1816] hover:border-[#d4800a] hover:text-[#d4800a]"
        >
          +
        </Button>
      </div>
    </div>
  );
}
