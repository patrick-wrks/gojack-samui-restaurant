'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useCartTotals } from '@/hooks/useCartTotals';
import { useCurrencySymbol } from '@/store/store-settings-store';
import { insertOrder } from '@/lib/orders';
import { PaymentModal } from './PaymentModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Cart() {
  const {
    cart,
    payType,
    orderNum,
    discount,
    setDiscount,
    clearCart,
    incrementOrderNum,
    addTodayOrder,
    initOrderNum,
    refreshTodayStats,
  } = useCartStore();
  const { subtotal, discountAmount, total } = useCartTotals(cart, discount);
  const currency = useCurrencySymbol();
  const [paymentOpen, setPaymentOpen] = useState(false);

  // Initialize order number from database on mount
  useEffect(() => {
    initOrderNum();
    refreshTodayStats();
  }, [initOrderNum, refreshTodayStats]);

  const handleAddDiscount = () => {
    const v = window.prompt(`ส่วนลด (${currency}):`);
    if (v != null && !Number.isNaN(Number(v)) && Number(v) >= 0) {
      setDiscount(Number(v));
    }
  };

  const handleAddNote = () => {
    window.alert('ฟีเจอร์หมายเหตุจะเปิดใช้งานเมื่อเชื่อมต่อฐานข้อมูลแล้ว');
  };

  const handleConfirmOrder = async () => {
    const nextOrderNum = orderNum + 1;
    try {
      await insertOrder({
        orderNumber: nextOrderNum,
        total,
        paymentMethod: payType,
        items: cart,
      });
      addTodayOrder(total);
      incrementOrderNum();
      clearCart();
    } catch (error) {
      console.error('Failed to save order:', error);
      window.alert(
        'ไม่สามารถบันทึกออเดอร์ได้ กรุณาลองใหม่อีกครั้ง\n(Could not save order, please try again)'
      );
    }
  };

  return (
    <>
      <div className="w-[340px] h-full flex flex-col bg-white border-l border-[#e4e0d8]">
        {/* Header */}
        <div className="p-4 border-b border-[#e4e0d8] bg-[#faf9f7]">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-[#6b6358]">
              ออเดอร์ปัจจุบัน
            </h3>
            <span className="text-xs font-semibold text-[#1a1816] font-heading bg-[#f2f0eb] px-2 py-1 rounded">
              #{orderNum}
            </span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 py-8">
              <div className="w-14 h-14 rounded-full bg-[#f2f0eb] flex items-center justify-center text-2xl">
                🛒
              </div>
              <p className="text-sm text-[#9a9288] text-center">
                แตะเมนูเพื่อเพิ่มออเดอร์
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <CartLineItem key={item.id} item={item} currency={currency} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e4e0d8] bg-[#faf9f7]">
          {/* Action Buttons */}
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              onClick={clearCart}
              className="flex-1 py-2 h-auto rounded-lg border-[#e4e0d8] bg-white text-[#6b6358] text-xs font-semibold hover:bg-[#f2f0eb] hover:border-[#d4800a]"
            >
              🗑 ล้าง
            </Button>
            <Button
              variant="outline"
              onClick={handleAddDiscount}
              className="flex-1 py-2 h-auto rounded-lg border-[#e4e0d8] bg-white text-[#6b6358] text-xs font-semibold hover:bg-[#f2f0eb] hover:border-[#d4800a]"
            >
              🏷 ส่วนลด
            </Button>
            <Button
              variant="outline"
              onClick={handleAddNote}
              className="flex-1 py-2 h-auto rounded-lg border-[#e4e0d8] bg-white text-[#6b6358] text-xs font-semibold hover:bg-[#f2f0eb] hover:border-[#d4800a]"
            >
              📝 หมายเหตุ
            </Button>
          </div>

          {/* Summary */}
          <div className="mb-3 space-y-1.5 py-2 border-y border-[#e4e0d8]">
            <div className="flex justify-between items-center text-xs text-[#6b6358]">
              <span>ยอดรวม</span>
              <span className="text-[#1a1816] font-medium tabular-nums">
                {currency}{subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#6b6358]">ส่วนลด</span>
              <span className="text-green-600 font-medium tabular-nums">
                –{currency}{discountAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#e4e0d8]">
              <span className="text-sm font-bold text-[#1a1816]">รวมทั้งสิ้น</span>
              <span className="text-lg font-bold text-[#d4800a] font-heading tabular-nums">
                {currency}{total.toLocaleString()}
              </span>
            </div>
          </div>

          <Button
            onClick={() => cart.length > 0 && setPaymentOpen(true)}
            disabled={cart.length === 0}
            className={cn(
              'w-full rounded-lg py-3 h-auto text-sm font-bold font-heading',
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
  currency,
}: {
  item: { id: number; name: string; price: number; qty: number };
  currency: string;
}) {
  const updateQty = useCartStore((s) => s.updateQty);

  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f8f6f2] border border-[#e4e0d8]">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#1a1816] truncate">
          {item.name}
        </div>
        <div className="text-xs text-[#9a9288]">
          {currency}{item.price} × {item.qty} = {currency}{(item.price * item.qty).toLocaleString()}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQty(item.id, -1)}
          className="w-7 h-7 rounded-md border-[#e4e0d8] bg-white text-[#1a1816] p-0 hover:border-[#d4800a] hover:text-[#d4800a]"
        >
          −
        </Button>
        <span className="text-sm font-bold w-5 text-center font-heading">
          {item.qty}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQty(item.id, 1)}
          className="w-7 h-7 rounded-md border-[#e4e0d8] bg-white text-[#1a1816] p-0 hover:border-[#d4800a] hover:text-[#d4800a]"
        >
          +
        </Button>
      </div>
    </div>
  );
}
