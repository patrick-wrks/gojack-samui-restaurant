'use client';

import { useState, useRef } from 'react';
import { ChevronDown, Trash2, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useCartTotals } from '@/hooks/useCartTotals';
import { insertOrder } from '@/lib/orders';
import { PaymentModal } from './PaymentModal';

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
        <div className="px-4 py-3 border-b border-[#e4e0d8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4800a] rounded-full flex items-center justify-center">
              <span className="text-lg">🛒</span>
            </div>
            <div>
              <h3 className="font-heading text-lg font-extrabold">ออเดอร์ปัจจุบัน</h3>
              <span className="text-xs text-[#9a9288] font-heading">
                #{orderNum} · {cart.reduce((sum, i) => sum + i.qty, 0)} รายการ
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#f7f5f0] flex items-center justify-center text-[#9a9288] active:bg-[#e4e0d8] transition-colors touch-target"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        {/* Payment Type */}
        <div className="px-4 py-3 border-b border-[#e4e0d8]">
          <div className="flex bg-[#f7f5f0] rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setPayType('cash')}
              className={`flex-1 py-3 px-3 rounded-lg text-sm font-bold transition-all touch-target ${
                payType === 'cash'
                  ? 'bg-[#d4800a] text-white shadow-md'
                  : 'bg-transparent text-[#6b6358]'
              }`}
            >
              💵 เงินสด
            </button>
            <button
              type="button"
              onClick={() => setPayType('bank')}
              className={`flex-1 py-3 px-3 rounded-lg text-sm font-bold transition-all touch-target ${
                payType === 'bank'
                  ? 'bg-[#d4800a] text-white shadow-md'
                  : 'bg-transparent text-[#6b6358]'
              }`}
            >
              🏦 โอนเงิน
            </button>
          </div>
        </div>

        {/* Cart Items - Flexible height */}
        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 py-8">
              <div className="w-20 h-20 bg-[#f7f5f0] rounded-full flex items-center justify-center">
                <span className="text-4xl">🛒</span>
              </div>
              <p className="text-sm text-[#9a9288]">แตะเมนูเพื่อเพิ่มออเดอร์</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-[#d4800a] text-black rounded-lg text-sm font-bold"
              >
                ไปเลือกเมนู
              </button>
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
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={clearCart}
              className="flex-1 py-2.5 rounded-xl border border-[#e4e0d8] bg-white text-[#9a9288] text-sm font-bold touch-target active:bg-[#f7f5f0] transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              ล้าง
            </button>
            <button
              type="button"
              onClick={handleAddDiscount}
              className="flex-1 py-2.5 rounded-xl border border-[#e4e0d8] bg-white text-[#9a9288] text-sm font-bold touch-target active:bg-[#f7f5f0] transition-colors flex items-center justify-center gap-1.5"
            >
              <Tag className="w-4 h-4" />
              ส่วนลด
            </button>
          </div>

          {/* Summary */}
          <div className="mb-3 space-y-1.5 py-2 border-y border-[#e4e0d8]">
            <div className="flex justify-between text-sm text-[#9a9288]">
              <span>ยอดรวม</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#9a9288]">ส่วนลด</span>
                <span className="text-[#16a34a]">–฿{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-extrabold pt-2 text-[#1a1816] font-heading">
              <span>รวมทั้งสิ้น</span>
              <span className="text-[#d4800a]">฿{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={() => cart.length > 0 && setPaymentOpen(true)}
            disabled={cart.length === 0}
            className="w-full bg-[#16a34a] border-none rounded-xl py-4 text-white font-heading font-black text-base touch-target transition-all disabled:bg-[#e4e0d8] disabled:text-[#9a9288] disabled:cursor-not-allowed active:opacity-90 shadow-[0_4px_15px_rgba(22,163,74,0.3)]"
          >
            ยืนยันออเดอร์ — ฿{total.toLocaleString()}
          </button>
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
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f7f5f0] border border-[#e4e0d8]">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-[#1a1816] leading-tight">{item.name}</div>
        <div className="text-xs text-[#9a9288] mt-0.5">
          ฿{item.price} × {item.qty} = <span className="font-bold text-[#d4800a]">฿{(item.price * item.qty).toLocaleString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => updateQty(item.id, -1)}
          className="w-9 h-9 rounded-lg border border-[#e4e0d8] bg-white text-[#1a1816] text-lg flex items-center justify-center active:bg-[#f7f5f0] active:border-[#d4800a] transition-colors touch-target"
        >
          −
        </button>
        <span className="text-base font-extrabold w-6 text-center font-heading">
          {item.qty}
        </span>
        <button
          type="button"
          onClick={() => updateQty(item.id, 1)}
          className="w-9 h-9 rounded-lg border border-[#e4e0d8] bg-white text-[#1a1816] text-lg flex items-center justify-center active:bg-[#f7f5f0] active:border-[#d4800a] transition-colors touch-target"
        >
          +
        </button>
      </div>
    </div>
  );
}
