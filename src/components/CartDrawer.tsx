'use client';

import { useState, useRef } from 'react';
import { ChevronDown, Trash2, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useCartTotals } from '@/hooks/useCartTotals';
import { useCurrencySymbol } from '@/store/store-settings-store';
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
      <div
        className="md:hidden fixed inset-0 bg-black/40 z-50 backdrop-blur-[2px] animate-[fadeIn_.15s_ease]"
        onClick={onClose}
      />

      <div
        ref={drawerRef}
        className="md:hidden fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-2xl flex flex-col safe-bottom animate-[slideUp_.25s_cubic-bezier(.22,1,.36,1)]"
        style={{
          height: 'calc(100vh - 60px)',
          transform: `translateY(${translateY}px)`,
          transition: translateY === 0 ? 'transform 0.25s cubic-bezier(.22,1,.36,1)' : 'none',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#e8e4de]" />
        </div>

        <div className="px-4 py-3 border-b border-[#e8e4de] flex items-center justify-between gap-3 shrink-0 min-w-0 bg-[#faf9f7]">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-[#1a1816] flex items-center justify-center shrink-0 text-white text-lg">
              🛒
            </div>
            <div className="min-w-0 overflow-hidden">
              <h3 className="font-heading text-base font-bold text-[#1a1816] text-truncate-safe">
                ออเดอร์ปัจจุบัน
              </h3>
              <span className="text-[12px] text-[#6b6358] text-truncate-safe block">
                #{orderNum} · {cart.reduce((sum, i) => sum + i.qty, 0)} รายการ
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-9 h-9 shrink-0 rounded-full bg-[#eeebe6] text-[#6b6358] hover:bg-[#e8e4de] touch-target"
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>

        <div className="px-4 py-3 border-b border-[#e8e4de] shrink-0">
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
                'flex-1 py-2.5 px-3 rounded-md text-[13px] font-semibold touch-target transition-all duration-200',
                'data-[state=off]:bg-transparent data-[state=off]:text-[#6b6358]',
                'data-[state=on]:bg-[#1a1816] data-[state=on]:text-white'
              )}
            >
              💵 เงินสด
            </ToggleGroupItem>
            <ToggleGroupItem
              value="bank"
              className={cn(
                'flex-1 py-2.5 px-3 rounded-md text-[13px] font-semibold touch-target transition-all duration-200',
                'data-[state=off]:bg-transparent data-[state=off]:text-[#6b6358]',
                'data-[state=on]:bg-[#1a1816] data-[state=on]:text-white'
              )}
            >
              🏦 โอนเงิน
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-[#f0eeea] flex items-center justify-center text-3xl">
                🛒
              </div>
              <p className="text-[14px] text-[#6b6358] text-center">แตะเมนูเพื่อเพิ่มออเดอร์</p>
              <Button
                onClick={onClose}
                className="bg-[#1a1816] hover:bg-[#2d2a26] text-white rounded-lg text-[13px] font-semibold px-5 py-2.5"
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

        <div className="px-4 py-4 border-t border-[#e8e4de] bg-[#faf9f7] shrink-0">
          <div className="flex gap-2 mb-3 min-w-0">
            <Button
              variant="outline"
              onClick={clearCart}
              className="flex-1 min-w-0 py-2.5 h-auto rounded-lg border-[#e8e4de] bg-white text-[#6b6358] text-[13px] font-semibold touch-target hover:bg-[#f0eeea] flex items-center justify-center gap-2 text-truncate-safe overflow-hidden"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              ล้าง
            </Button>
            <Button
              variant="outline"
              onClick={handleAddDiscount}
              className="flex-1 min-w-0 py-2.5 h-auto rounded-lg border-[#e8e4de] bg-white text-[#6b6358] text-[13px] font-semibold touch-target hover:bg-[#f0eeea] flex items-center justify-center gap-2 text-truncate-safe overflow-hidden"
            >
              <Tag className="w-4 h-4 shrink-0" />
              ส่วนลด
            </Button>
          </div>

          <div className="mb-3 space-y-1.5 py-2 border-y border-[#e8e4de] min-w-0">
            <div className="flex justify-between items-center gap-2 text-[13px] text-[#6b6358] min-w-0">
              <span className="shrink-0">ยอดรวม</span>
              <span className="text-[#1a1816] font-medium tabular-nums text-right text-truncate-safe min-w-0">
                {currency}{subtotal.toLocaleString()}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center gap-2 text-[13px] min-w-0">
                <span className="text-[#6b6358] shrink-0">ส่วนลด</span>
                <span className="text-[#16a34a] font-medium tabular-nums text-right text-truncate-safe min-w-0">
                  –{currency}{discountAmount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center gap-2 text-base font-bold pt-2 text-[#1a1816] font-heading min-w-0">
              <span className="shrink-0">รวมทั้งสิ้น</span>
              <span className="tabular-nums text-right text-truncate-safe min-w-0">
                {currency}{total.toLocaleString()}
              </span>
            </div>
          </div>

          <Button
            onClick={() => cart.length > 0 && setPaymentOpen(true)}
            disabled={cart.length === 0}
            className={cn(
              'w-full min-w-0 rounded-lg py-4 h-auto text-[15px] font-bold font-heading touch-target text-truncate-safe',
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
}: {
  item: { id: number; name: string; price: number; qty: number };
}) {
  const updateQty = useCartStore((s) => s.updateQty);
  const currency = useCurrencySymbol();

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f8f6f2] border border-[#e8e4de] min-w-0 overflow-hidden">
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="text-[13px] font-semibold text-[#1a1816] leading-tight text-truncate-safe">
          {item.name}
        </div>
        <div className="text-[12px] text-[#6b6358] mt-0.5 text-truncate-safe">
          {currency}{item.price} × {item.qty} ={' '}
          <span className="font-semibold text-[#1a1816]">{currency}{(item.price * item.qty).toLocaleString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQty(item.id, -1)}
          className="w-9 h-9 rounded-lg border-[#e8e4de] bg-white text-[#1a1816] hover:bg-[#f0eeea] hover:border-[#d4cfc5] touch-target font-semibold"
        >
          −
        </Button>
        <span className="text-[14px] font-bold w-6 text-center font-heading tabular-nums">
          {item.qty}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateQty(item.id, 1)}
          className="w-9 h-9 rounded-lg border-[#e8e4de] bg-white text-[#1a1816] hover:bg-[#f0eeea] hover:border-[#d4cfc5] touch-target font-semibold"
        >
          +
        </Button>
      </div>
    </div>
  );
}
