'use client';

import { useState, useCallback, useEffect } from 'react';
import { LayoutGrid, ArrowLeft, Receipt } from 'lucide-react';
import { MenuGrid } from '@/components/MenuGrid';
import { PaymentModal } from '@/components/PaymentModal';
import { useOrdersRealtime } from '@/hooks/useOrdersRealtime';
import { useCurrencySymbol } from '@/store/store-settings-store';
import {
  createOpenOrder,
  fetchOpenOrders,
  fetchOpenOrderByTable,
  addItemsToOpenOrder,
  completeOrder,
  type OrderWithItems,
} from '@/lib/orders';
import type { PaymentMethod } from '@/types/pos';
import type { Product } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TABLE_COUNT = 10;
const TABLE_NUMBERS = Array.from({ length: TABLE_COUNT }, (_, i) => String(i + 1));

function getOpenOrdersByTable(orders: OrderWithItems[]): Record<string, OrderWithItems> {
  const map: Record<string, OrderWithItems> = {};
  for (const o of orders) {
    if (o.table_number) map[o.table_number] = o;
  }
  return map;
}

export default function TablesPage() {
  const [openOrders, setOpenOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<OrderWithItems | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const currency = useCurrencySymbol();

  const loadOpenOrders = useCallback(async () => {
    const data = await fetchOpenOrders();
    setOpenOrders(data);
  }, []);

  useOrdersRealtime(loadOpenOrders);

  useEffect(() => {
    setLoading(true);
    loadOpenOrders().finally(() => setLoading(false));
  }, [loadOpenOrders]);

  const openOrdersByTable = getOpenOrdersByTable(openOrders);

  const handleSelectTable = async (tableNumber: string) => {
    const existing = openOrdersByTable[tableNumber];
    if (existing) {
      setSelectedTable(tableNumber);
      setDetailOrder(existing);
      return;
    }
    setAdding(true);
    try {
      await createOpenOrder(tableNumber, []);
      const order = await fetchOpenOrderByTable(tableNumber);
      if (order) {
        setSelectedTable(tableNumber);
        setDetailOrder(order);
        setOpenOrders((prev) => [...prev.filter((o) => o.table_number !== tableNumber), order]);
      }
    } finally {
      setAdding(false);
    }
  };

  const handleBack = () => {
    setSelectedTable(null);
    setDetailOrder(null);
    setPaymentOpen(false);
    loadOpenOrders();
  };

  const handleAddProduct = useCallback(
    async (product: Product) => {
      if (!detailOrder) return;
      setAdding(true);
      try {
        await addItemsToOpenOrder(detailOrder.id, [
          {
            product_id: product.id,
            product_name: product.name,
            qty: 1,
            price_at_sale: product.price,
          },
        ]);
        const updated = await fetchOpenOrderByTable(detailOrder.table_number ?? '');
        if (updated) setDetailOrder(updated);
        loadOpenOrders();
      } finally {
        setAdding(false);
      }
    },
    [detailOrder, loadOpenOrders]
  );

  const handleRequestBill = () => {
    setPaymentOpen(true);
  };

  const handlePaymentConfirm = useCallback(
    async (method: PaymentMethod) => {
      if (!detailOrder) return;
      const total = Number(detailOrder.total);
      await completeOrder(detailOrder.id, method, total);
      setPaymentOpen(false);
      setSelectedTable(null);
      setDetailOrder(null);
      loadOpenOrders();
    },
    [detailOrder, loadOpenOrders]
  );

  if (selectedTable && detailOrder) {
    const total = Number(detailOrder.total);
    const itemCount = detailOrder.order_items.reduce((s, i) => s + i.qty, 0);

    return (
      <div className="flex flex-col h-full overflow-hidden bg-[#f8f6f2]">
        <header className="shrink-0 flex items-center gap-3 px-3 sm:px-4 py-3 bg-white border-b border-[#e4e0d8]">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0 rounded-full"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading font-bold text-[#1a1816] truncate">
              โต๊ะ {detailOrder.table_number}
            </h1>
            <p className="text-xs text-[#9a9288]">
              ออเดอร์ #{detailOrder.order_number}
              {itemCount > 0 && ` · ${itemCount} รายการ`}
            </p>
          </div>
        </header>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-hidden">
            <MenuGrid
              cartPeekMode={false}
              onAddProduct={handleAddProduct}
            />
          </div>

          <aside className="shrink-0 border-t border-[#e4e0d8] bg-white p-4">
            <div className="space-y-3">
              {detailOrder.order_items.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {detailOrder.order_items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm text-[#1a1816]"
                    >
                      <span className="truncate">
                        {item.product_name} × {item.qty}
                      </span>
                      <span className="font-heading tabular-nums shrink-0">
                        {currency}
                        {(item.qty * Number(item.price_at_sale)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-[#e4e0d8]">
                <span className="font-heading font-bold text-[#1a1816]">รวม</span>
                <span className="text-lg font-bold text-green-600 font-heading tabular-nums">
                  {currency}
                  {total.toLocaleString()}
                </span>
              </div>
              <Button
                onClick={handleRequestBill}
                disabled={itemCount === 0 || adding}
                className="w-full bg-[#FA3E3E] hover:bg-[#FA3E3E]/90 text-white font-heading font-bold"
              >
                <Receipt className="w-4 h-4 mr-2" />
                ขอใบเสร็จ
              </Button>
            </div>
          </aside>
        </div>

        <PaymentModal
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          total={total}
          payType="cash"
          orderNum={detailOrder.order_number}
          onConfirm={handlePaymentConfirm}
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-[#f8f6f2] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-xl font-bold text-[#1a1816] mb-4 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5" />
          โต๊ะ / Service
        </h1>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#9a9288]">
            <div className="w-10 h-10 rounded-full border-2 border-[#e4e0d8] border-t-[#FA3E3E] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {TABLE_NUMBERS.map((num) => {
              const order = openOrdersByTable[num];
              const hasOrder = !!order;
              const itemCount = order?.order_items.reduce((s, i) => s + i.qty, 0) ?? 0;
              const total = order ? Number(order.total) : 0;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleSelectTable(num)}
                  disabled={adding}
                  className={cn(
                    'rounded-xl border-2 p-4 text-left transition-all',
                    'hover:border-[#FA3E3E] hover:shadow-md',
                    'active:scale-[0.98]',
                    hasOrder
                      ? 'border-[#FA3E3E]/30 bg-white'
                      : 'border-[#e4e0d8] bg-white'
                  )}
                >
                  <div className="font-heading font-bold text-[#1a1816]">
                    โต๊ะ {num}
                  </div>
                  {hasOrder ? (
                    <div className="mt-2 text-sm text-[#6b6358] space-y-0.5">
                      <div>#{order.order_number}</div>
                      <div>
                        {itemCount} รายการ · {currency}
                        {total.toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-[#9a9288]">ไม่มีออเดอร์</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
