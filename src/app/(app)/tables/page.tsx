'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutGrid, 
  ArrowLeft, 
  RotateCcw, 
  WifiOff, 
  Check, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ShoppingCart,
  ChevronUp,
  Utensils,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MenuGrid } from '@/components/MenuGrid';
import { Cart } from '@/components/Cart';
import { CartDrawer } from '@/components/CartDrawer';
import { PaymentModal } from '@/components/PaymentModal';
import { useOrdersRealtime } from '@/hooks/useOrdersRealtime';
import { useCurrencySymbol } from '@/store/store-settings-store';
import {
  createOpenOrder,
  fetchOpenOrders,
  fetchOpenOrderByTable,
  addItemsToOpenOrder,
  updateOrderItemQuantity,
  deleteOrderItem,
  deleteOrder,
  completeOrder,
  type OrderWithItems,
} from '@/lib/orders';
import type { PaymentMethod } from '@/types/pos';
import type { Product } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TABLE_COUNT = 12;
const TABLE_NUMBERS = Array.from({ length: TABLE_COUNT }, (_, i) => String(i + 1));

// Toast notification types
type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// Recently added item highlight type
interface RecentAdd {
  productId: string | number;
  timestamp: number;
}

function getOpenOrdersByTable(orders: OrderWithItems[]): Record<string, OrderWithItems> {
  const map: Record<string, OrderWithItems> = {};
  for (const o of orders) {
    if (o.table_number) map[o.table_number] = o;
  }
  return map;
}

function orderTotalFromItems(
  items: { price_at_sale: number; qty: number }[]
): number {
  return items.reduce((sum, i) => sum + Number(i.price_at_sale) * i.qty, 0);
}

// Haptic feedback helper
function haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    const patterns: Record<string, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [30, 50, 30],
      error: [40, 100, 40],
    };
    navigator.vibrate(patterns[type] ?? 10);
  }
}

// Skeleton components for loading states
function TableSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-[#e4e0d8] bg-white p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 bg-[#e4e0d8] rounded w-20" />
        <div className="h-3 bg-[#e4e0d8] rounded-full w-3" />
      </div>
      <div className="h-4 bg-[#e4e0d8]/50 rounded w-24" />
    </div>
  );
}

// Toast component
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 left-4 right-4 z-[400] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto mx-auto max-w-md w-full px-4 py-3 rounded-xl shadow-lg',
            'flex items-center gap-3 animate-[fadeIn_.2s_ease]',
            toast.type === 'error' && 'bg-red-500 text-white',
            toast.type === 'success' && 'bg-green-600 text-white',
            toast.type === 'info' && 'bg-[#1a1816] text-white'
          )}
          onClick={() => onRemove(toast.id)}
        >
          {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {toast.type === 'success' && <Check className="w-5 h-5" />}
          {toast.type === 'info' && <span className="text-lg">ℹ️</span>}
          <span className="text-sm font-medium flex-1">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

// Offline indicator
function OfflineIndicator({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[500] bg-red-500 text-white px-4 py-2 text-center text-sm font-medium animate-[fadeIn_.2s_ease]">
      <WifiOff className="w-4 h-4 inline mr-2" />
      ไม่มีการเชื่อมต่ออินเทอร์เน็ต
    </div>
  );
}

// Pull to refresh handler hook
function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop ?? 0;
    if (scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop ?? 0;
    if (scrollTop === 0 && touchStartY.current > 0) {
      const delta = e.touches[0].clientY - touchStartY.current;
      if (delta > 0) {
        const progress = Math.min(delta / 100, 1);
        setPullProgress(progress);
        setIsPulling(progress > 0.3);
      }
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (isPulling && pullProgress >= 0.8) {
      haptic('medium');
      await onRefresh();
    }
    setIsPulling(false);
    setPullProgress(0);
    touchStartY.current = 0;
  }, [isPulling, pullProgress, onRefresh]);

  return { containerRef, isPulling, pullProgress, handleTouchStart, handleTouchMove, handleTouchEnd };
}

// Recently added indicator overlay
function AddFeedbackOverlay({ recentAdds }: { recentAdds: RecentAdd[] }) {
  return (
    <>
      {recentAdds.map((add) => (
        <div
          key={`${add.productId}-${add.timestamp}`}
          className="fixed inset-0 z-[300] pointer-events-none flex items-center justify-center"
        >
          <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg animate-[addFeedback_.35s_ease-out_forwards] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">เพิ่มรายการแล้ว</span>
          </div>
        </div>
      ))}
    </>
  );
}

// Get quantity map for products in order
function getProductQuantityMap(orderItems: OrderWithItems['order_items']): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of orderItems) {
    // We need to map by product name since we don't have product_id in some cases
    map[item.product_name] = item.qty;
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
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [viewTransition, setViewTransition] = useState<'entering' | 'entered' | 'exiting'>('entered');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [cartMode, setCartMode] = useState<'peek' | 'open'>('peek');
  const [tableDiscount, setTableDiscount] = useState(0);
  const [recentAdds, setRecentAdds] = useState<RecentAdd[]>([]);
  const currency = useCurrencySymbol();
  const detailOrderBeforeMutate = useRef<OrderWithItems | null>(null);

  // Toast helper
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('เชื่อมต่ออินเทอร์เน็ตแล้ว', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('ไม่มีการเชื่อมต่ออินเทอร์เน็ต', 'error');
    };

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  const loadOpenOrders = useCallback(async () => {
    try {
      const data = await fetchOpenOrders();
      setOpenOrders(data);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'ไม่สามารถโหลดออเดอร์ได้';
      setError(msg);
      showToast(msg, 'error');
    }
  }, [showToast]);

  useOrdersRealtime(loadOpenOrders);

  useEffect(() => {
    setLoading(true);
    loadOpenOrders().finally(() => setLoading(false));
  }, [loadOpenOrders]);

  const openOrdersByTable = useMemo(() => getOpenOrdersByTable(openOrders), [openOrders]);

  // Sync detail view when orders update
  useEffect(() => {
    if (!selectedTable) return;
    const order = openOrders.find((o) => o.table_number === selectedTable);
    if (order) setDetailOrder(order);
  }, [selectedTable, openOrders]);

  // Clear old recent adds (match shortened animation)
  useEffect(() => {
    if (recentAdds.length === 0) return;
    const timer = setTimeout(() => {
      setRecentAdds((prev) => prev.filter((add) => Date.now() - add.timestamp < 400));
    }, 400);
    return () => clearTimeout(timer);
  }, [recentAdds]);

  // View transition handler: enter from right so slide-in animation is visible
  const transitionToDetail = useCallback((tableNumber: string, order: OrderWithItems | null) => {
    haptic('light');
    setViewTransition('entering');
    setSelectedTable(tableNumber);
    setDetailOrder(order);
    setTimeout(() => setViewTransition('entered'), 20);
  }, []);

  const handleSelectTable = useCallback(async (tableNumber: string) => {
    setError(null);
    const existing = openOrdersByTable[tableNumber];
    if (existing) {
      transitionToDetail(tableNumber, existing);
      return;
    }
    setAdding(true);
    haptic('medium');
    try {
      await createOpenOrder(tableNumber, []);
      const order = await fetchOpenOrderByTable(tableNumber);
      if (order) {
        setOpenOrders((prev) => [...prev.filter((o) => o.table_number !== tableNumber), order]);
        transitionToDetail(tableNumber, order);
        showToast(`เปิดโต๊ะ ${tableNumber} แล้ว`, 'success');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'ไม่สามารถสร้างออเดอร์ได้';
      setError(msg);
      showToast(msg, 'error');
      haptic('error');
    } finally {
      setAdding(false);
    }
  }, [openOrdersByTable, transitionToDetail, showToast]);

  const handleBack = useCallback(() => {
    haptic('light');
    setViewTransition('exiting');
    setTimeout(() => {
      setSelectedTable(null);
      setDetailOrder(null);
      setPaymentOpen(false);
      setCartMode('peek');
      setShowClearAllConfirm(false);
      setTableDiscount(0);
      setError(null);
      setViewTransition('entered');
      loadOpenOrders();
    }, 150);
  }, [loadOpenOrders]);

  // Swipe to go back
  const touchStartX = useRef(0);
  const handleTouchStartSwipe = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEndSwipe = useCallback((e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 100 && selectedTable) {
      handleBack();
    }
  }, [selectedTable, handleBack]);

  const handleAddProduct = useCallback(
    async (product: Product) => {
      if (!detailOrder) return;
      setError(null);
      haptic('light');
      detailOrderBeforeMutate.current = detailOrder;

      // Show feedback immediately
      setRecentAdds((prev) => [...prev, { productId: product.id, timestamp: Date.now() }]);

      const existingItem = detailOrder.order_items.find(
        (item) => item.product_id != null && item.product_id === product.id
      );

      if (existingItem) {
        const newQty = existingItem.qty + 1;
        const optimistic: OrderWithItems = {
          ...detailOrder,
          order_items: detailOrder.order_items.map((i) =>
            i.id === existingItem.id ? { ...i, qty: newQty } : i
          ),
        };
        optimistic.total = orderTotalFromItems(optimistic.order_items);
        setDetailOrder(optimistic);
        setAdding(false);
        try {
          await updateOrderItemQuantity(existingItem.id, newQty);
          const updated = await fetchOpenOrderByTable(detailOrder.table_number ?? '');
          if (updated) setDetailOrder(updated);
          showToast(`เพิ่ม ${product.name} (${newQty})`, 'success');
        } catch (e) {
          setDetailOrder(detailOrderBeforeMutate.current);
          const msg = e instanceof Error ? e.message : 'ไม่สามารถเพิ่มรายการได้';
          setError(msg);
          showToast(msg, 'error');
          haptic('error');
        }
        loadOpenOrders();
        return;
      }

      const tempId = `temp-${product.id}-${Date.now()}`;
      const newItem = {
        id: tempId,
        product_id: product.id,
        product_name: product.name,
        qty: 1,
        price_at_sale: product.price,
      };
      const optimistic: OrderWithItems = {
        ...detailOrder,
        order_items: [...detailOrder.order_items, newItem],
        total: orderTotalFromItems([...detailOrder.order_items, newItem]),
      };
      setDetailOrder(optimistic);
      setAdding(false);
      try {
        await addItemsToOpenOrder(detailOrder.id, [
          { product_id: product.id, product_name: product.name, qty: 1, price_at_sale: product.price },
        ]);
        const updated = await fetchOpenOrderByTable(detailOrder.table_number ?? '');
        if (updated) setDetailOrder(updated);
        showToast(`เพิ่ม ${product.name}`, 'success');
      } catch (e) {
        setDetailOrder(detailOrderBeforeMutate.current);
        const msg = e instanceof Error ? e.message : 'ไม่สามารถเพิ่มรายการได้';
        setError(msg);
        showToast(msg, 'error');
        haptic('error');
      }
      loadOpenOrders();
    },
    [detailOrder, loadOpenOrders, showToast]
  );

  const handleUpdateQuantity = useCallback(async (itemId: string, qty: number) => {
    if (!detailOrder) return;
    if (itemId.startsWith('temp-')) return;
    detailOrderBeforeMutate.current = detailOrder;
    const optimistic: OrderWithItems = {
      ...detailOrder,
      order_items: detailOrder.order_items.map((i) =>
        i.id === itemId ? { ...i, qty } : i
      ),
    };
    optimistic.total = orderTotalFromItems(optimistic.order_items);
    setDetailOrder(optimistic);
    setAdding(false);
    try {
      await updateOrderItemQuantity(itemId, qty);
      const updated = await fetchOpenOrderByTable(detailOrder.table_number ?? '');
      if (updated) setDetailOrder(updated);
    } catch (e) {
      setDetailOrder(detailOrderBeforeMutate.current);
      showToast(e instanceof Error ? e.message : 'ไม่สามารถอัพเดทจำนวนได้', 'error');
    }
    loadOpenOrders();
  }, [detailOrder, loadOpenOrders, showToast]);

  const handleDeleteItem = useCallback(async (itemId: string) => {
    if (!detailOrder) return;
    if (itemId.startsWith('temp-')) return;
    detailOrderBeforeMutate.current = detailOrder;
    const optimistic: OrderWithItems = {
      ...detailOrder,
      order_items: detailOrder.order_items.filter((i) => i.id !== itemId),
    };
    optimistic.total = orderTotalFromItems(optimistic.order_items);
    setDetailOrder(optimistic);
    setAdding(false);
    try {
      await deleteOrderItem(itemId);
      const updated = await fetchOpenOrderByTable(detailOrder.table_number ?? '');
      if (updated) setDetailOrder(updated);
      showToast('ลบรายการแล้ว', 'success');
    } catch (e) {
      setDetailOrder(detailOrderBeforeMutate.current);
      showToast(e instanceof Error ? e.message : 'ไม่สามารถลบรายการได้', 'error');
    }
    loadOpenOrders();
  }, [detailOrder, loadOpenOrders, showToast]);

  const handleClearAllItems = useCallback(async () => {
    if (!detailOrder) return;
    setAdding(true);
    haptic('heavy');
    try {
      // Delete all items one by one
      await Promise.all(detailOrder.order_items.map(item => deleteOrderItem(item.id)));
      const updated = await fetchOpenOrderByTable(detailOrder.table_number ?? '');
      if (updated) {
        setDetailOrder(updated);
        loadOpenOrders();
        showToast('ลบรายการทั้งหมดแล้ว', 'success');
      }
      setShowClearAllConfirm(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'ไม่สามารถลบรายการได้';
      showToast(msg, 'error');
      haptic('error');
    } finally {
      setAdding(false);
    }
  }, [detailOrder, loadOpenOrders, showToast]);

  const handleRequestBill = useCallback(() => {
    haptic('medium');
    setPaymentOpen(true);
  }, []);

  const handlePaymentConfirm = useCallback(
    async (method: PaymentMethod) => {
      if (!detailOrder) return;
      const subtotal = Number(detailOrder.total);
      const totalToCharge = Math.max(0, subtotal - tableDiscount);
      haptic('success');
      await completeOrder(detailOrder.id, method, totalToCharge);
      setPaymentOpen(false);
      setTableDiscount(0);
      showToast('ชำระเงินสำเร็จ!', 'success');
      setTimeout(() => {
        setSelectedTable(null);
        setDetailOrder(null);
        loadOpenOrders();
      }, 500);
    },
    [detailOrder, tableDiscount, loadOpenOrders, showToast]
  );

  const handleDeleteOrder = useCallback(async (tableNumber: string) => {
    const order = openOrdersByTable[tableNumber];
    if (!order) return;
    haptic('medium');
    try {
      await deleteOrder(order.id);
      setOpenOrders((prev) => prev.filter((o) => o.table_number !== tableNumber));
      showToast(`ยกเลิกโต๊ะ ${tableNumber} แล้ว`, 'success');
      setShowDeleteConfirm(null);
      handleBack();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'ไม่สามารถยกเลิกออเดอร์ได้';
      showToast(msg, 'error');
      haptic('error');
    }
  }, [openOrdersByTable, showToast, handleBack]);

  // Pull to refresh for table grid
  const { containerRef, isPulling, pullProgress, handleTouchStart, handleTouchMove, handleTouchEnd } = 
    usePullToRefresh(async () => {
      haptic('medium');
      await loadOpenOrders();
      showToast('รีเฟรชแล้ว', 'success');
    });

  // Detail view - same cart layout as POS: sidebar on desktop, peek bar + drawer on mobile
  if (selectedTable && detailOrder) {
    const subtotal = Number(detailOrder.total);
    const totalToCharge = Math.max(0, subtotal - tableDiscount);
    const itemCount = detailOrder.order_items.reduce((s, i) => s + i.qty, 0);
    const productQtyMap = getProductQuantityMap(detailOrder.order_items);
    const tableCartItems = detailOrder.order_items.map((item) => ({
      id: item.id,
      name: item.product_name,
      price: Number(item.price_at_sale),
      qty: item.qty,
    }));
    const tableMode = {
      items: tableCartItems,
      tableNumber: detailOrder.table_number ?? '',
      orderNumber: detailOrder.order_number,
      discount: tableDiscount,
      onDiscount: setTableDiscount,
      onUpdateQty: (orderItemId: string, delta: number) => {
        const item = detailOrder.order_items.find((i) => i.id === orderItemId);
        if (!item) return;
        const newQty = item.qty + delta;
        if (newQty <= 0) handleDeleteItem(orderItemId);
        else handleUpdateQuantity(orderItemId, newQty);
      },
      onClear: () => {
        setCartMode('peek');
        setShowClearAllConfirm(true);
      },
      onRequestBill: () => {
        setCartMode('peek');
        handleRequestBill();
      },
    };
    return (
      <div 
        className={cn(
          "flex flex-col h-full min-h-0 overflow-hidden bg-[#f8f6f2] transition-transform duration-200 ease-out",
          viewTransition === 'entering' && "translate-x-full",
          viewTransition === 'entered' && "translate-x-0",
          viewTransition === 'exiting' && "translate-x-1/4 opacity-50"
        )}
        onTouchStart={handleTouchStartSwipe}
        onTouchEnd={handleTouchEndSwipe}
      >
        <OfflineIndicator isOnline={isOnline} />
        <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
        <AddFeedbackOverlay recentAdds={recentAdds} />

        {/* Header */}
        <header className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-[#e4e0d8] safe-top">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0 rounded-full touch-target h-12 w-12 active:bg-[#f7f5f0]"
            aria-label="กลับ"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading font-bold text-lg text-[#1a1816] truncate">
              โต๊ะ {detailOrder.table_number}
            </h1>
            <p className="text-xs text-[#9a9288]">
              ออเดอร์ #{detailOrder.order_number}
              {itemCount > 0 && ` · ${itemCount} รายการ`}
            </p>
          </div>
          {itemCount === 0 ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteConfirm(detailOrder.table_number ?? null)}
              className="shrink-0 rounded-full touch-target h-12 w-12 text-red-500 hover:text-red-600 hover:bg-red-50"
              aria-label="ยกเลิกออเดอร์"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartMode('open')}
              className="md:hidden shrink-0 rounded-full touch-target h-12 w-12 text-[#FA3E3E] hover:text-[#FA3E3E] hover:bg-[#FA3E3E]/10 relative"
              aria-label="ดูออเดอร์"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FA3E3E] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            </Button>
          )}
        </header>

        {/* Main content - same layout as POS: menu + cart sidebar on desktop */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <main className="flex-1 min-w-0 overflow-hidden">
            <MenuGrid 
              cartPeekMode={cartMode === 'peek'}
              onAddProduct={handleAddProduct}
              highlightRecent={recentAdds.map((a) => a.productId)}
              productQuantities={productQtyMap}
            />
          </main>

          {/* Desktop Cart - hidden on mobile */}
          <aside className="hidden md:block shrink-0">
            <Cart tableMode={tableMode} />
          </aside>

          {/* Mobile Cart Drawer - same as POS */}
          <CartDrawer
            open={cartMode === 'open'}
            onClose={() => setCartMode('peek')}
            tableMode={tableMode}
          />

          {/* Mobile Cart Peek Bar - same as POS: only when drawer closed */}
          <div
            className={cn(
              'md:hidden fixed left-0 right-0 z-40 transition-transform duration-300',
              cartMode === 'open' ? 'translate-y-full' : 'translate-y-0'
            )}
            style={{ bottom: '72px' }}
          >
            {cartMode === 'peek' && (
              <button
                type="button"
                onClick={() => setCartMode('open')}
                className="w-full flex items-center justify-between gap-4 px-4 py-3 bg-white border-t border-[#e4e0d8] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] active:bg-[#f7f5f0]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#FA3E3E] flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-sm font-semibold text-[#1a1816]">
                      {itemCount > 0 ? `${itemCount} รายการ` : 'ตะกร้าว่าง'}
                    </div>
                    <div className="text-xs text-[#9a9288]">
                      แตะเพื่อดูตะกร้า
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-lg font-bold text-[#1a1816] font-heading tabular-nums">
                    {currency}{totalToCharge.toLocaleString()}
                  </span>
                  <ChevronUp className="w-5 h-5 text-[#9a9288]" />
                </div>
              </button>
            )}
          </div>
        </div>

        <PaymentModal
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          total={totalToCharge}
          payType="cash"
          orderNum={detailOrder.order_number}
          onConfirm={handlePaymentConfirm}
        />

        {/* Delete confirmation modal for single order */}
        {showDeleteConfirm && (
          <div 
            className="fixed inset-0 bg-black/50 z-[350] flex items-center justify-center p-4 animate-[fadeIn_.15s_ease]"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <div 
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-[slideUp_.2s_ease]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading font-bold text-lg mb-2">ยกเลิกออเดอร์?</h3>
              <p className="text-[#6b6358] text-sm mb-6">
                คุณต้องการยกเลิกออเดอร์ที่โต๊ะ {showDeleteConfirm} ใช่หรือไม่?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 min-h-12 rounded-xl"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={() => handleDeleteOrder(showDeleteConfirm)}
                  className="flex-1 min-h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                >
                  ยืนยัน
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Clear all items confirmation modal */}
        {showClearAllConfirm && (
          <div 
            className="fixed inset-0 bg-black/50 z-[360] flex items-center justify-center p-4 animate-[fadeIn_.15s_ease]"
            onClick={() => setShowClearAllConfirm(false)}
          >
            <div 
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-[slideUp_.2s_ease]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2 text-center">ลบรายการทั้งหมด?</h3>
              <p className="text-[#6b6358] text-sm mb-6 text-center">
                คุณต้องการลบรายการอาหารทั้งหมด {itemCount} รายการ ใช่หรือไม่?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowClearAllConfirm(false)}
                  className="flex-1 min-h-12 rounded-xl"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleClearAllItems}
                  disabled={adding}
                  className="flex-1 min-h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                >
                  {adding ? 'กำลังลบ...' : 'ลบทั้งหมด'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Table grid view
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#f8f6f2]">
      <OfflineIndicator isOnline={isOnline} />
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <div 
        ref={containerRef}
        className="flex-1 min-h-0 overflow-auto px-3 sm:px-4 py-4 pb-24 safe-bottom momentum-scroll"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull to refresh indicator */}
        <div 
          className={cn(
            "flex items-center justify-center py-4 transition-all duration-200",
            isPulling ? "opacity-100" : "opacity-0 h-0 py-0 overflow-hidden"
          )}
          style={{ transform: `translateY(${(1 - pullProgress) * -20}px)` }}
        >
          <RotateCcw 
            className={cn(
              "w-6 h-6 text-[#FA3E3E] transition-transform duration-200",
              pullProgress >= 0.8 && "rotate-180"
            )} 
            style={{ transform: `rotate(${pullProgress * 360}deg)` }}
          />
          <span className="ml-2 text-sm text-[#6b6358]">
            {pullProgress >= 0.8 ? 'ปล่อยเพื่อรีเฟรช' : 'ดึงลงเพื่อรีเฟรช'}
          </span>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 px-1">
            <div>
              <h1 className="font-heading text-2xl font-bold text-[#1a1816] flex items-center gap-2">
                <LayoutGrid className="w-7 h-7 shrink-0 text-[#FA3E3E]" />
                โต๊ะ
              </h1>
              <p className="text-sm text-[#9a9288] mt-0.5">เลือกโต๊ะเพื่อเปิดออเดอร์</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                haptic('light');
                loadOpenOrders();
                showToast('รีเฟรชแล้ว', 'success');
              }}
              disabled={loading}
              className="text-[#6b6358] hover:text-[#1a1816] h-10 px-3"
            >
              <RotateCcw className={cn("w-4 h-4 mr-1.5", loading && "animate-spin")} />
              รีเฟรช
            </Button>
          </div>

          {/* Status legend */}
          <div className="flex items-center gap-4 mb-4 px-1 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#d4cfc5]" />
              <span className="text-[#6b6358]">ว่าง</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-[#6b6358]">มีลูกค้า</span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <TableSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                      'group relative rounded-2xl border-2 p-5 text-left transition-all touch-target',
                      'hover:shadow-lg hover:-translate-y-0.5',
                      'active:scale-[0.98] active:shadow-inner',
                      'focus:outline-none focus:ring-2 focus:ring-[#FA3E3E]/30',
                      hasOrder
                        ? 'border-[#FA3E3E]/30 bg-white shadow-md hover:border-[#FA3E3E]/50'
                        : 'border-[#e4e0d8] bg-white hover:border-[#FA3E3E]/50 hover:bg-[#faf9f7]'
                    )}
                    aria-label={`โต๊ะ ${num}${hasOrder ? ` มี ${itemCount} รายการ` : ' ว่าง'}`}
                  >
                    {/* Top row: Table number and status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn(
                        "font-heading font-bold text-xl",
                        hasOrder ? "text-[#1a1816]" : "text-[#6b6358]"
                      )}>
                        โต๊ะ {num}
                      </div>
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        hasOrder 
                          ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" 
                          : "bg-[#d4cfc5]"
                      )} />
                    </div>

                    {/* Content area */}
                    {hasOrder ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Utensils className="w-4 h-4 text-[#FA3E3E]" />
                          <span className="text-[#1a1816] font-medium">{itemCount} รายการ</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-[#9a9288]">ยอดรวม</span>
                          <span className="font-heading font-bold text-lg text-[#FA3E3E] tabular-nums">
                            {currency}{total.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-[#9a9288] truncate">
                          #{order.order_number}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[#9a9288]">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">แตะเพื่อเปิดออเดอร์</span>
                      </div>
                    )}

                    {/* Hover action hint */}
                    <div className={cn(
                      "absolute inset-0 rounded-2xl border-2 border-[#FA3E3E] opacity-0 transition-opacity",
                      "group-hover:opacity-100 pointer-events-none"
                    )} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty state hint */}
          {!loading && Object.keys(openOrdersByTable).length === 0 && (
            <div className="text-center py-16 text-[#9a9288]">
              <div className="w-20 h-20 rounded-full bg-[#f2f0eb] flex items-center justify-center mx-auto mb-4">
                <LayoutGrid className="w-10 h-10 opacity-30" />
              </div>
              <p className="text-base font-medium">ยังไม่มีโต๊ะที่กำลังใช้งาน</p>
              <p className="text-sm mt-1">แตะที่โต๊ะเพื่อเปิดออเดอร์ใหม่</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating action button for mobile */}
      <div className="fixed bottom-6 right-4 md:hidden safe-bottom">
        <Button
          onClick={() => {
            haptic('light');
            loadOpenOrders();
          }}
          disabled={loading}
          size="icon"
          className="h-14 w-14 rounded-full bg-[#FA3E3E] hover:bg-[#FA3E3E]/90 text-white shadow-lg shadow-red-200/50"
        >
          <RotateCcw className={cn("w-6 h-6", loading && "animate-spin")} />
        </Button>
      </div>
    </div>
  );
}
