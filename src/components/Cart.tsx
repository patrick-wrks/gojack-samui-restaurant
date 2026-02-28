'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useCartTotals } from '@/hooks/useCartTotals';
import { useCurrencySymbol } from '@/store/store-settings-store';
import { insertOrder } from '@/lib/orders';
import { PaymentModal } from './PaymentModal';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

export function Cart() {
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
  const currency = useCurrencySymbol();
  const [paymentOpen, setPaymentOpen] = useState(false);

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
    await insertOrder({
      orderNumber: nextOrderNum,
      total,
      paymentMethod: payType,
      items: cart,
    });
    addTodayOrder(total);
    incrementOrderNum();
    clearCart();
  };

  return (
    <>
      <div className="w-[340px] min-w-[300px] max-w-[100vw] flex flex-col shrink-0 overflow-hidden bg-white border-l border-[#e8e4de] shadow-[ -4px_0_24px_rgba(0,0,0,0.04)]">
        {/* Header */}
        <div className="p-4 border-b border-[#e8e4de] shrink-0 bg-[#faf9f7]">
          <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
            <h3 className="font-heading text-[13px] font-bold uppercase tracking-wider text-[#6b6358] min-w-0 text-truncate-safe">
              ออเดอร์ปัจจุบัน
            </h3>
            <span className="text-[12px] font-semibold text-[#1a1816] font-heading tabular-nums shrink-0">
              #{orderNum}
            </span>
          </div>

          <ToggleGroup
            type="single"
            value={payType}
            onValueChange={(v) => v && setPayType(v as 'cash' | 'bank')}
            className="flex bg-[#eeebe6] rounded-lg p-0.5 gap-0.5 w-full"
            spacing={0}
          >
            <ToggleGroupItem
              value="cash"
              className={cn(
                'flex-1 py-2 px-3 rounded-md text-[12px] font-semibold font-sans whitespace-nowrap transition-all duration-200',
                'data-[state=off]:bg-transparent data-[state=off]:text-[#6b6358]',
                'data-[state=on]:bg-[#1a1816] data-[state=on]:text-white'
              )}
            >
              💵 เงินสด
            </ToggleGroupItem>
            <ToggleGroupItem
              value="bank"
              className={cn(
                'flex-1 py-2 px-3 rounded-md text-[12px] font-semibold font-sans whitespace-nowrap transition-all duration-200',
                'data-[state=off]:bg-transparent data-[state=off]:text-[#6b6358]',
                'data-[state=on]:bg-[#1a1816] data-[state=on]:text-white'
              )}
            >
              🏦 โอนเงิน
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 py-8">
              <div className="w-14 h-14 rounded-full bg-[#f0eeea] flex items-center justify-center text-2xl">
                🛒
              </div>
              <p className="text-[13px] text-[#6b6358] text-center max-w-[180px]">
                แตะเมนูเพื่อเพิ่มออเดอร์
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((i) => (
                <CartLineItem key={i.id} item={i} currency={currency} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e8e4de] shrink-0 min-w-0 bg-[#faf9f7]">
          <div className="flex gap-2 mb-3 min-w-0">
            <Button
              variant="outline"
              onClick={clearCart}
              className="flex-1 min-w-0 py-2 h-auto rounded-lg border-[#e8e4de] bg-white text-[#6b6358] text-[12px] font-semibold hover:bg-[#f0eeea] hover:border-[#d4cfc5] hover:text-[#1a1816] text-truncate-safe overflow-hidden"
            >
              🗑 ล้าง
            </Button>
            <Button
              variant="outline"
              onClick={handleAddDiscount}
              className="flex-1 min-w-0 py-2 h-auto rounded-lg border-[#e8e4de] bg-white text-[#6b6358] text-[12px] font-semibold hover:bg-[#f0eeea] hover:border-[#d4cfc5] hover:text-[#1a1816] text-truncate-safe overflow-hidden"
            >
              🏷 ส่วนลด
            </Button>
            <Button
              variant="outline"
              onClick={handleAddNote}
              className="flex-1 min-w-0 py-2 h-auto rounded-lg border-[#e8e4de] bg-white text-[#6b6358] text-[12px] font-semibold hover:bg-[#f0eeea] hover:border-[#d4cfc5] hover:text-[#1a1816] text-truncate-safe overflow-hidden"
            >
              📝 หมายเหตุ
            </Button>
          </div>

          <div className="mb-3 space-y-1.5 py-2 min-w-0">
            <div className="flex justify-between items-center gap-2 text-[12px] text-[#6b6358] min-w-0">
              <span className="shrink-0">ยอดรวม</span>
              <span className="text-[#1a1816] font-medium tabular-nums text-right text-truncate-safe min-w-0">
                {currency}{subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2 text-[12px] min-w-0">
              <span className="text-[#6b6358] shrink-0">ส่วนลด</span>
              <span className="text-[#16a34a] font-medium tabular-nums text-right text-truncate-safe min-w-0">
                –{currency}{discountAmount.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-[#e8e4de] pt-2 mt-2 flex justify-between items-center gap-2 min-w-0">
              <span className="text-[13px] font-bold text-[#1a1816] shrink-0">รวมทั้งสิ้น</span>
              <span className="text-lg font-bold text-[#1a1816] font-heading tabular-nums text-right text-truncate-safe min-w-0">
                {currency}{total.toLocaleString()}
              </span>
            </div>
          </div>

          <Button
            onClick={() => cart.length > 0 && setPaymentOpen(true)}
            disabled={cart.length === 0}
            className={cn(
              'w-full min-w-0 rounded-lg py-3.5 h-auto text-[14px] font-bold font-heading touch-target text-truncate-safe',
              'bg-[#16a34a] text-white hover:bg-[#15803d] disabled:bg-[#e8e4de] disabled:text-[#9a9288]',
              'shadow-[0_2px_8px_rgba(22,163,74,0.25)] hover:shadow-[0_4px_12px_rgba(22,163,74,0.3)]'
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
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f8f6f2] border border-[#e8e4de] min-w-0 overflow-hidden">
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="text-[13px] font-semibold leading-tight text-[#1a1816] text-truncate-safe">
          {item.name}
        </div>
        <div className="text-[11px] text-[#6b6358] mt-0.5 text-truncate-safe">
          {currency}{item.price} × {item.qty} = {currency}{(item.price * item.qty).toLocaleString()}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQty(item.id, -1)}
          className="w-8 h-8 rounded-lg border-[#e8e4de] bg-white text-[#1a1816] hover:bg-[#f0eeea] hover:border-[#d4cfc5] text-sm font-semibold"
        >
          −
        </Button>
        <span className="text-[13px] font-bold w-5 text-center font-heading tabular-nums">
          {item.qty}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQty(item.id, 1)}
          className="w-8 h-8 rounded-lg border-[#e8e4de] bg-white text-[#1a1816] hover:bg-[#f0eeea] hover:border-[#d4cfc5] text-sm font-semibold"
        >
          +
        </Button>
      </div>
    </div>
  );
}
