'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useCartTotals } from '@/hooks/useCartTotals';
import { useCurrencySymbol } from '@/store/store-settings-store';
import { insertOrder } from '@/lib/orders';
import { PaymentModal } from './PaymentModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types/pos';

/** Table mode: show order for a table; actions go to API, primary CTA is "Request bill". */
export interface CartTableMode {
  items: Array<{ id: string; name: string; price: number; qty: number }>;
  tableNumber: string;
  orderNumber: number;
  discount?: number;
  onDiscount?: (amount: number) => void;
  onUpdateQty: (orderItemId: string, delta: number) => void;
  onClear?: () => void;
  onRequestBill: () => void;
}

interface CartProps {
  /** When set, cart shows table order and uses callbacks instead of store. */
  tableMode?: CartTableMode;
}

export function Cart({ tableMode }: CartProps) {
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
    orderNote,
    setOrderNote,
  } = useCartStore();
  const posItems = cart;
  const items = tableMode ? tableMode.items : posItems;
  const tableDiscount = tableMode?.discount ?? 0;
  const { subtotal, discountAmount, total } = useCartTotals(
    tableMode ? tableMode.items.map((i) => ({ ...i, id: 0, cat: '' })) : cart,
    tableMode ? tableDiscount : discount
  );
  const currency = useCurrencySymbol();
  const [paymentOpen, setPaymentOpen] = useState(false);

  // Initialize order number from database on mount (POS only)
  useEffect(() => {
    if (!tableMode) {
      initOrderNum();
      refreshTodayStats();
    }
  }, [tableMode, initOrderNum, refreshTodayStats]);

  const handleAddDiscount = () => {
    if (tableMode?.onDiscount) {
      const v = window.prompt(`ส่วนลด (${currency}):`);
      if (v != null && !Number.isNaN(Number(v)) && Number(v) >= 0) {
        tableMode.onDiscount(Number(v));
      }
      return;
    }
    const v = window.prompt(`ส่วนลด (${currency}):`);
    if (v != null && !Number.isNaN(Number(v)) && Number(v) >= 0) {
      setDiscount(Number(v));
    }
  };

  const handleAddNote = () => {
    if (tableMode) {
      window.alert('หมายเหตุใช้ได้เฉพาะออเดอร์ที่ชำระเงินทันที (POS)');
      return;
    }
    const current = orderNote || '';
    const v = window.prompt('หมายเหตุออเดอร์ (เช่น ไม่ใส่ผัก, แพ้ gluten):', current);
    if (v != null) setOrderNote(v.trim());
  };

  const handleConfirmOrder = async (method: PaymentMethod) => {
    const nextOrderNum = orderNum + 1;
    await insertOrder({
      orderNumber: nextOrderNum,
      total,
      paymentMethod: method,
      items: cart,
      ...(orderNote && { note: orderNote }),
    });
    addTodayOrder(total);
    incrementOrderNum();
    clearCart();
  };

  const handleUpdateQty = (id: string | number, delta: number) => {
    if (tableMode && typeof id === 'string') tableMode.onUpdateQty(id, delta);
    else if (!tableMode && typeof id === 'number') useCartStore.getState().updateQty(id, delta);
  };

  return (
    <>
      <div className="w-[340px] h-full flex flex-col bg-white border-l border-[#e4e0d8]">
        {/* Header */}
        <div className="p-4 border-b border-[#e4e0d8] bg-[#faf9f7]">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-[#6b6358]">
              {tableMode ? `ออเดอร์ โต๊ะ ${tableMode.tableNumber}` : 'ออเดอร์ปัจจุบัน'}
            </h3>
            <span className="text-xs font-semibold text-[#1a1816] font-heading bg-[#f2f0eb] px-2 py-1 rounded">
              #{tableMode ? tableMode.orderNumber : orderNum}
            </span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          {items.length === 0 ? (
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
              {items.map((item) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  currency={currency}
                  onUpdateQty={tableMode ? handleUpdateQty : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e4e0d8] bg-[#faf9f7]">
          {!tableMode && (
            <>
              {/* Action Buttons - POS only */}
              <div className="flex gap-2 mb-3">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="flex-1 py-2 h-auto rounded-lg border-[#e4e0d8] bg-white text-[#6b6358] text-xs font-semibold hover:bg-[#f2f0eb] hover:border-[#FA3E3E]"
                >
                  🗑 ล้าง
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddDiscount}
                  className="flex-1 py-2 h-auto rounded-lg border-[#e4e0d8] bg-white text-[#6b6358] text-xs font-semibold hover:bg-[#f2f0eb] hover:border-[#FA3E3E]"
                >
                  🏷 ส่วนลด
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddNote}
                  className="flex-1 py-2 h-auto rounded-lg border-[#e4e0d8] bg-white text-[#6b6358] text-xs font-semibold hover:bg-[#f2f0eb] hover:border-[#FA3E3E]"
                >
                  📝 หมายเหตุ
                </Button>
              </div>

              {/* Summary */}
              <div className="mb-3 space-y-1.5 py-2 border-y border-[#e4e0d8]">
                {orderNote ? (
                  <div className="text-xs text-[#6b6358] pb-1">
                    <span className="font-medium">หมายเหตุ:</span> {orderNote}
                  </div>
                ) : null}
                <div className="flex justify-between items-center text-xs text-[#6b6358]">
                  <span>ยอดรวม</span>
                  <span className="text-[#1a1816] font-medium tabular-nums">
                    {currency}{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6b6358]">ส่วนลด</span>
                  <span className="text-[#1a1816] font-medium tabular-nums">
                    –{currency}{discountAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#e4e0d8]">
                  <span className="text-sm font-bold text-[#1a1816]">รวมทั้งสิ้น</span>
                  <span className="text-lg font-bold text-[#1a1816] font-heading tabular-nums">
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
            </>
          )}
          {tableMode && (
            <>
              {/* Action Buttons - identical to POS (ล้าง, ส่วนลด, หมายเหตุ) */}
              <div className="flex gap-2 mb-3">
                <Button
                  variant="outline"
                  onClick={() => tableMode.onClear?.()}
                  className="flex-1 py-2 h-auto rounded-lg border-[#e4e0d8] bg-white text-[#6b6358] text-xs font-semibold hover:bg-[#f2f0eb] hover:border-[#FA3E3E]"
                >
                  🗑 ล้าง
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddDiscount}
                  className="flex-1 py-2 h-auto rounded-lg border-[#e4e0d8] bg-white text-[#6b6358] text-xs font-semibold hover:bg-[#f2f0eb] hover:border-[#FA3E3E]"
                >
                  🏷 ส่วนลด
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddNote}
                  className="flex-1 py-2 h-auto rounded-lg border-[#e4e0d8] bg-white text-[#6b6358] text-xs font-semibold hover:bg-[#f2f0eb] hover:border-[#FA3E3E]"
                >
                  📝 หมายเหตุ
                </Button>
              </div>

              {/* Summary - identical to POS (ยอดรวม, ส่วนลด, รวมทั้งสิ้น) */}
              <div className="mb-3 space-y-1.5 py-2 border-y border-[#e4e0d8]">
                <div className="flex justify-between items-center text-xs text-[#6b6358]">
                  <span>ยอดรวม</span>
                  <span className="text-[#1a1816] font-medium tabular-nums">
                    {currency}{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6b6358]">ส่วนลด</span>
                  <span className="text-[#1a1816] font-medium tabular-nums">
                    –{currency}{discountAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#e4e0d8]">
                  <span className="text-sm font-bold text-[#1a1816]">รวมทั้งสิ้น</span>
                  <span className="text-lg font-bold text-[#1a1816] font-heading tabular-nums">
                    {currency}{total.toLocaleString()}
                  </span>
                </div>
              </div>
              <Button
                onClick={tableMode.onRequestBill}
                disabled={items.length === 0}
                className={cn(
                  'w-full rounded-lg py-3 h-auto text-sm font-bold font-heading',
                  'bg-[#FA3E3E] text-white hover:bg-[#FA3E3E]/90',
                  'disabled:bg-[#e4e0d8] disabled:text-[#9a9288]'
                )}
              >
                ขอใบเสร็จ — {currency}{total.toLocaleString()}
              </Button>
            </>
          )}
        </div>
      </div>

      {!tableMode && (
        <PaymentModal
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          total={total}
          payType={payType}
          orderNum={orderNum}
          onConfirm={handleConfirmOrder}
        />
      )}
    </>
  );
}

function CartLineItem({
  item,
  currency,
  onUpdateQty,
}: {
  item: { id: string | number; name: string; price: number; qty: number };
  currency: string;
  onUpdateQty?: (id: string | number, delta: number) => void;
}) {
  const storeUpdateQty = useCartStore((s) => s.updateQty);
  const updateQty = onUpdateQty ?? ((id, delta) => { if (typeof id === 'number') storeUpdateQty(id, delta); });

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
          className="w-7 h-7 rounded-md border-[#e4e0d8] bg-white text-[#1a1816] p-0 hover:border-[#FA3E3E] hover:text-[#FA3E3E]"
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
          className="w-7 h-7 rounded-md border-[#e4e0d8] bg-white text-[#1a1816] p-0 hover:border-[#FA3E3E] hover:text-[#FA3E3E]"
        >
          +
        </Button>
      </div>
    </div>
  );
}
