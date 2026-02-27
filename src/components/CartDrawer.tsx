'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
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

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm animate-[fadeIn_.15s_ease]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[24px] shadow-[0_-4px_30px_rgba(0,0,0,0.15)] max-h-[85vh] flex flex-col animate-[slideUp_.25s_cubic-bezier(.22,1,.36,1)] safe-bottom">
        {/* Handle */}
        <div className="flex items-center justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-10 h-1 bg-[#e4e0d8] rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-[#e4e0d8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-heading text-lg font-extrabold">ออเดอร์ปัจจุบัน</h3>
            <span className="text-xs text-[#9a9288] bg-white py-1 px-2.5 rounded-md border border-[#e4e0d8] font-heading">
              #{orderNum}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f7f5f0] flex items-center justify-center text-[#9a9288] active:bg-[#e4e0d8] transition-colors touch-target"
          >
            <X className="w-5 h-5" />
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

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-[200px] max-h-[40vh]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 py-8">
              <div className="text-5xl opacity-20">🛒</div>
              <p className="text-sm text-[#9a9288]">แตะเมนูเพื่อเพิ่มออเดอร์</p>
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
        <div className="px-4 py-4 border-t border-[#e4e0d8] bg-white">
          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={clearCart}
              className="flex-1 py-3 rounded-xl border border-[#e4e0d8] bg-white text-[#9a9288] text-sm font-bold touch-target active:bg-[#f7f5f0] transition-colors"
            >
              🗑 ล้าง
            </button>
            <button
              type="button"
              onClick={handleAddDiscount}
              className="flex-1 py-3 rounded-xl border border-[#e4e0d8] bg-white text-[#9a9288] text-sm font-bold touch-target active:bg-[#f7f5f0] transition-colors"
            >
              🏷 ส่วนลด
            </button>
          </div>

          {/* Summary */}
          <div className="mb-4 space-y-1">
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
            <div className="flex justify-between text-xl font-extrabold pt-2 mt-2 border-t border-[#e4e0d8] text-[#1a1816] font-heading">
              <span>รวมทั้งสิ้น</span>
              <span>฿{total.toLocaleString()}</span>
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
