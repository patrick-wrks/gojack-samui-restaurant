'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useCartTotals } from '@/hooks/useCartTotals';
import { insertOrder } from '@/lib/orders';
import { PaymentModal } from './PaymentModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
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
  const [paymentOpen, setPaymentOpen] = useState(false);

  const handleAddDiscount = () => {
    const v = window.prompt('ส่วนลด (฿):');
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
      <div className="w-[330px] bg-white border-l border-[#e4e0d8] flex flex-col shrink-0">
        {/* Header */}
        <div className="p-3.5 border-b border-[#e4e0d8]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading text-sm font-extrabold">ออเดอร์ปัจจุบัน</h3>
            <Badge
              variant="outline"
              className="text-[11px] text-[#9a9288] bg-white py-0.5 px-2 rounded-md border-[#e4e0d8] font-heading"
            >
              #{orderNum}
            </Badge>
          </div>

          {/* Payment Type Toggle */}
          <ToggleGroup
            type="single"
            value={payType}
            onValueChange={(v) => v && setPayType(v as 'cash' | 'bank')}
            className="flex bg-white rounded-lg p-0.5 gap-0.5 border border-[#e4e0d8] w-full"
            spacing={0}
          >
            <ToggleGroupItem
              value="cash"
              className={cn(
                "flex-1 py-1.5 px-2 rounded-md text-[11px] font-bold font-sans whitespace-nowrap transition-all data-[state=off]:bg-transparent data-[state=off]:text-[#9a9288]",
                "data-[state=on]:bg-[#d4800a] data-[state=on]:text-black data-[state=on]:border-none"
              )}
            >
              💵 เงินสด
            </ToggleGroupItem>
            <ToggleGroupItem
              value="bank"
              className={cn(
                "flex-1 py-1.5 px-2 rounded-md text-[11px] font-bold font-sans whitespace-nowrap transition-all data-[state=off]:bg-transparent data-[state=off]:text-[#9a9288]",
                "data-[state=on]:bg-[#d4800a] data-[state=on]:text-black data-[state=on]:border-none"
              )}
            >
              🏦 โอนเงิน
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-1.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-1.5">
              <div className="text-[34px] opacity-15">🛒</div>
              <p className="text-[13px] text-[#9a9288]">แตะเมนูเพื่อเพิ่มออเดอร์</p>
            </div>
          ) : (
            cart.map((i) => (
              <CartLineItem key={i.id} item={i} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#e4e0d8]">
          {/* Action Buttons */}
          <div className="flex gap-1.5 mb-2.5">
            <Button
              variant="outline"
              onClick={clearCart}
              className="flex-1 py-1.5 h-auto rounded-lg border-[#e4e0d8] bg-transparent text-[#9a9288] text-[11px] font-bold hover:border-[#d4800a] hover:text-[#d4800a] hover:bg-[rgba(212,128,10,0.1)]"
            >
              🗑 ล้าง
            </Button>
            <Button
              variant="outline"
              onClick={handleAddDiscount}
              className="flex-1 py-1.5 h-auto rounded-lg border-[#e4e0d8] bg-transparent text-[#9a9288] text-[11px] font-bold hover:border-[#d4800a] hover:text-[#d4800a] hover:bg-[rgba(212,128,10,0.1)]"
            >
              🏷 ส่วนลด
            </Button>
            <Button
              variant="outline"
              onClick={handleAddNote}
              className="flex-1 py-1.5 h-auto rounded-lg border-[#e4e0d8] bg-transparent text-[#9a9288] text-[11px] font-bold hover:border-[#d4800a] hover:text-[#d4800a] hover:bg-[rgba(212,128,10,0.1)]"
            >
              📝 หมายเหตุ
            </Button>
          </div>

          {/* Summary */}
          <div className="mb-2.5 space-y-0.5">
            <div className="flex justify-between text-xs text-[#9a9288] py-0.5">
              <span>ยอดรวม</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs py-0.5">
              <span className="text-[#9a9288]">ส่วนลด</span>
              <span className="text-[#16a34a]">–฿{discountAmount.toLocaleString()}</span>
            </div>
            <Separator className="my-1.5 bg-[#e4e0d8]" />
            <div className="flex justify-between text-[19px] font-extrabold pt-2 text-[#1a1816] font-heading">
              <span>รวมทั้งสิ้น</span>
              <span>฿{total.toLocaleString()}</span>
            </div>
          </div>

          <Button
            onClick={() => cart.length > 0 && setPaymentOpen(true)}
            disabled={cart.length === 0}
            className="w-full bg-[#16a34a] hover:bg-[#16a34a]/90 border-none rounded-[11px] py-3.5 h-auto text-white font-heading font-black text-[15px] disabled:bg-[#e4e0d8] disabled:text-[#9a9288] hover:opacity-90 hover:shadow-[0_6px_20px_rgba(34,197,94,0.35)]"
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
    <div className="flex items-start gap-2 p-2 rounded-[10px] bg-[#f7f5f0] mb-1.5 border border-[#e4e0d8] animate-[popIn_.16s_ease]">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold leading-tight text-[#1a1816]">{item.name}</div>
        <div className="text-[11px] text-[#9a9288] mt-0.5">
          ฿{item.price} × {item.qty} = ฿{(item.price * item.qty).toLocaleString()}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQty(item.id, -1)}
          className="w-[22px] h-[22px] rounded-md border-[#e4e0d8] bg-white text-[#1a1816] p-0 hover:border-[#d4800a] hover:text-[#d4800a]"
        >
          −
        </Button>
        <span className="text-xs font-extrabold w-4 text-center font-heading">
          {item.qty}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQty(item.id, 1)}
          className="w-[22px] h-[22px] rounded-md border-[#e4e0d8] bg-white text-[#1a1816] p-0 hover:border-[#d4800a] hover:text-[#d4800a]"
        >
          +
        </Button>
      </div>
    </div>
  );
}
