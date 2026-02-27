'use client';

import { useState, useRef } from 'react';
import { ChevronDown, Trash2, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useCartTotals } from '@/hooks/useCartTotals';
import { insertOrder } from '@/lib/orders';
import { PaymentModal } from './PaymentModal';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const {
    cart,
    payType,
    setPayType,
    orderNum,
    discount,
    setDiscount,
    clearCart,
    incrementOrderNum,
    addTodayOrder,
  } = useCartStore();
  const { subtotal, discountAmount, total } = useCartTotals(cart, discount);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const [translateY, setTranslateY] = useState(0);

  const handleAddDiscount = () => {
    const v = window.prompt('ส่วนลด (฿):');
    if (v != null && !Number.isNaN(Number(v)) && Number(v) >= 0) {
      setDiscount(Number(v));
    }
  };

  const handleConfirmOrder = async () => {
    const nextOrderNum = orderNum + 1;
    await insertOrder({
      orderNumber: nextOrderNum,
      total,
      paymentMethod: payType,
      items: cart,
    });
    addTodayOrder(total);
    incrementOrderNum();
    clearCart();
    onClose();
  };

  // Touch handlers for swipe-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      setTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (translateY > 100) {
      onClose();
    }
    setTranslateY(0);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm animate-[fadeIn_.15s_ease]"
        onClick={onClose}
      />

      {/* Full Screen Cart Drawer */}
      <div
        ref={drawerRef}
        className="md:hidden fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-[24px] shadow-[0_-8px_40px_rgba(0,0,0,0.2)] flex flex-col safe-bottom animate-[slideUp_.25s_cubic-bezier(.22,1,.36,1)]"
        style={{
          height: 'calc(100vh - 60px)',
          transform: `translateY(${translateY}px)`,
          transition: translateY === 0 ? 'transform 0.25s cubic-bezier(.22,1,.36,1)' : 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe Handle */}
        <div className="flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-[#e4e0d8] rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-[#e4e0d8] flex items-center justify-between gap-3 shrink-0 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 bg-[#d4800a] rounded-full flex items-center justify-center shrink-0">
              <span className="text-lg">🛒</span>
            </div>
            <div className="min-w-0 overflow-hidden">
              <h3 className="font-heading text-lg font-extrabold text-truncate-safe">ออเดอร์ปัจจุบัน</h3>
              <span className="text-xs text-[#9a9288] font-heading text-truncate-safe block">
                #{orderNum} · {cart.reduce((sum, i) => sum + i.qty, 0)} รายการ
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-10 h-10 shrink-0 rounded-full bg-[#f7f5f0] text-[#9a9288] hover:bg-[#e4e0d8] touch-target"
          >
            <ChevronDown className="w-6 h-6" />
          </Button>
        </div>

        {/* Payment Type */}
        <div className="px-4 py-3 border-b border-[#e4e0d8]">
          <ToggleGroup
            type="single"
            value={payType}
            onValueChange={(v) => v && setPayType(v as 'cash' | 'bank')}
            className="flex bg-[#f7f5f0] rounded-xl p-1 gap-1 w-full"
            spacing={1}
          >
            <ToggleGroupItem
              value="cash"
              className={cn(
                "flex-1 py-3 px-3 rounded-lg text-sm font-bold touch-target data-[state=off]:bg-transparent data-[state=off]:text-[#6b6358]",
                "data-[state=on]:bg-[#d4800a] data-[state=on]:text-white data-[state=on]:shadow-md"
              )}
            >
              💵 เงินสด
            </ToggleGroupItem>
            <ToggleGroupItem
              value="bank"
              className={cn(
                "flex-1 py-3 px-3 rounded-lg text-sm font-bold touch-target data-[state=off]:bg-transparent data-[state=off]:text-[#6b6358]",
                "data-[state=on]:bg-[#d4800a] data-[state=on]:text-white data-[state=on]:shadow-md"
              )}
            >
              🏦 โอนเงิน
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Cart Items - Flexible height */}
        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 py-8">
              <div className="w-20 h-20 bg-[#f7f5f0] rounded-full flex items-center justify-center">
                <span className="text-4xl">🛒</span>
              </div>
              <p className="text-sm text-[#9a9288]">แตะเมนูเพื่อเพิ่มออเดอร์</p>
              <Button
                onClick={onClose}
                className="mt-2 bg-[#d4800a] hover:bg-[#d4800a]/90 text-black rounded-lg text-sm font-bold"
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

        {/* Footer Actions & Summary */}
        <div className="px-4 py-4 border-t border-[#e4e0d8] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {/* Action Buttons */}
          <div className="flex gap-2 mb-3 min-w-0">
            <Button
              variant="outline"
              onClick={clearCart}
              className="flex-1 min-w-0 py-2.5 h-auto rounded-xl border-[#e4e0d8] bg-white text-[#9a9288] text-sm font-bold touch-target hover:bg-[#f7f5f0] flex items-center justify-center gap-1.5 text-truncate-safe overflow-hidden"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              ล้าง
            </Button>
            <Button
              variant="outline"
              onClick={handleAddDiscount}
              className="flex-1 min-w-0 py-2.5 h-auto rounded-xl border-[#e4e0d8] bg-white text-[#9a9288] text-sm font-bold touch-target hover:bg-[#f7f5f0] flex items-center justify-center gap-1.5 text-truncate-safe overflow-hidden"
            >
              <Tag className="w-4 h-4 shrink-0" />
              ส่วนลด
            </Button>
          </div>

          {/* Summary */}
          <div className="mb-3 space-y-1.5 py-2 border-y border-[#e4e0d8] min-w-0">
            <div className="flex justify-between items-center gap-2 text-sm text-[#9a9288] min-w-0">
              <span className="shrink-0">ยอดรวม</span>
              <span className="text-truncate-safe min-w-0 text-right">฿{subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center gap-2 text-sm min-w-0">
                <span className="text-[#9a9288] shrink-0">ส่วนลด</span>
                <span className="text-[#16a34a] text-truncate-safe min-w-0 text-right">–฿{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center gap-2 text-xl font-extrabold pt-2 text-[#1a1816] font-heading min-w-0">
              <span className="shrink-0">รวมทั้งสิ้น</span>
              <span className="text-[#d4800a] text-truncate-safe min-w-0 text-right">฿{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={() => cart.length > 0 && setPaymentOpen(true)}
            disabled={cart.length === 0}
            className="w-full min-w-0 bg-[#16a34a] hover:bg-[#16a34a]/90 border-none rounded-xl py-4 h-auto text-white font-heading font-black text-base touch-target disabled:bg-[#e4e0d8] disabled:text-[#9a9288] active:opacity-90 shadow-[0_4px_15px_rgba(22,163,74,0.3)] text-truncate-safe"
          >
            ยืนยันออเดอร์ — ฿{total.toLocaleString()}
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

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f7f5f0] border border-[#e4e0d8] min-w-0 overflow-hidden">
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="text-sm font-bold text-[#1a1816] leading-tight text-truncate-safe">{item.name}</div>
        <div className="text-xs text-[#9a9288] mt-0.5 text-truncate-safe">
          ฿{item.price} × {item.qty} = <span className="font-bold text-[#d4800a]">฿{(item.price * item.qty).toLocaleString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQty(item.id, -1)}
          className="w-9 h-9 rounded-lg border-[#e4e0d8] bg-white text-[#1a1816] hover:border-[#d4800a] hover:text-[#d4800a] touch-target"
        >
          −
        </Button>
        <span className="text-base font-extrabold w-6 text-center font-heading">
          {item.qty}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQty(item.id, 1)}
          className="w-9 h-9 rounded-lg border-[#e4e0d8] bg-white text-[#1a1816] hover:border-[#d4800a] hover:text-[#d4800a] touch-target"
        >
          +
        </Button>
      </div>
    </div>
  );
}
