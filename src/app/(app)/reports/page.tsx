'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Download, Calendar, Trash2 } from 'lucide-react';
import { useOrdersRealtime } from '@/hooks/useOrdersRealtime';
import { useCurrencySymbol } from '@/store/store-settings-store';
import { fetchOrdersWithItems, deleteOrder } from '@/lib/orders';
import type { OrderWithItems } from '@/lib/orders';
import type { PaymentMethod } from '@/types/pos';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type PeriodKey = 'today' | 'week' | 'month' | 'custom';

interface ReportKpi {
  ic: string;
  val: string;
  lbl: string;
  dl: string;
  dir: 'up' | 'dn' | 'fl';
}

interface TopDish {
  n: string;
  cnt: number;
  rev: number;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<PeriodKey>('today');
  const [refreshKey, setRefreshKey] = useState(0);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{ id: string; orderNumber: number } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const currency = useCurrencySymbol();

  // Real-time subscription
  useOrdersRealtime(
    useCallback(() => {
      setRefreshKey((n) => n + 1);
    }, [])
  );

  // Fetch orders when period changes
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      const { startDate: sDate, endDate: eDate } = getDateRange(period, startDate, endDate);
      const data = await fetchOrdersWithItems(sDate, eDate);
      setOrders(data);
      setLoading(false);
    };
    loadOrders();
  }, [period, refreshKey, startDate, endDate]);

  // Calculate all metrics from real data
  const {
    kpis,
    revenueByHour,
    ordersByHour,
    topDishes,
    cashPercentage,
    bankPercentage,
    recentOrders,
    hours,
    dateRangeLabel,
  } = useMemo(() => {
    return calculateMetrics(orders, currency, period, startDate, endDate);
  }, [orders, currency, period, startDate, endDate]);

  const maxRev = Math.max(...revenueByHour, 1);
  const maxOrd = Math.max(...ordersByHour, 1);
  const maxDish = topDishes[0]?.cnt ?? 1;

  // CSV Download function
  const downloadCSV = () => {
    if (orders.length === 0) return;

    // Build CSV content
    const headers = ['Order Number', 'Date', 'Time', 'Payment Method', 'Total', 'Items Count', 'Items Detail'];
    const rows = orders.map((o) => {
      const date = new Date(o.created_at);
      const dateStr = date.toLocaleDateString('th-TH');
      const timeStr = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const itemsDetail = o.order_items.map((i) => `${i.product_name} x${i.qty}`).join('; ');
      return [
        o.order_number,
        dateStr,
        timeStr,
        o.payment_method === 'cash' ? 'Cash' : 'Bank Transfer',
        o.total,
        o.order_items.reduce((sum, i) => sum + i.qty, 0),
        itemsDetail,
      ];
    });

    // Add summary rows
    const summaryRows = [
      [],
      ['Summary'],
      ['Total Revenue', '', '', '', orders.reduce((sum, o) => sum + Number(o.total), 0)],
      ['Total Orders', '', '', '', orders.length],
      ['Cash Orders', '', '', '', orders.filter((o) => o.payment_method === 'cash').length],
      ['Bank Orders', '', '', '', orders.filter((o) => o.payment_method === 'bank').length],
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(',')),
      ...summaryRows.map((r) => r.join(',')),
    ].join('\n');

    // Download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders-${dateRangeLabel.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  // Handle custom date apply
  const applyCustomDate = () => {
    if (startDate && endDate) {
      setPeriod('custom');
      setCustomDateOpen(false);
    }
  };

  // Handle delete order
  const handleDeleteClick = (orderId: string, orderNumber: number) => {
    setOrderToDelete({ id: orderId, orderNumber });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    setDeleting(true);
    try {
      await deleteOrder(orderToDelete.id);
      // Refresh orders after delete
      setRefreshKey((n) => n + 1);
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('ไม่สามารถลบออเดอร์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[#e4e0d8] bg-white px-4 md:px-5 py-3 md:py-3.5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading text-lg md:text-xl font-black leading-none mb-0.5">
              รายงาน & วิเคราะห์
            </h2>
            <p className="text-xs text-[#9a9288]">ยอดขาย จำนวนออเดอร์ เมนูขายดี</p>
          </div>
          <button
            type="button"
            onClick={downloadCSV}
            disabled={loading || orders.length === 0}
            className="flex items-center gap-1.5 py-2 px-3 rounded-lg border border-[#e4e0d8] bg-transparent text-[#9a9288] text-xs font-bold hover:border-[#1a1816] hover:text-[#1a1816] transition-colors touch-target disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ส่งออก CSV</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 md:px-5 py-3 md:py-4 pb-24 md:pb-8 momentum-scroll">
        {/* Period Selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
          {(['today', 'week', 'month'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setPeriod(k)}
              disabled={loading}
              className={`py-2.5 md:py-1.5 px-4 md:px-3.5 rounded-xl md:rounded-lg text-sm md:text-xs font-bold border transition-all font-sans touch-target whitespace-nowrap disabled:opacity-50 ${
                period === k
                  ? 'bg-[#1a1816] border-[#1a1816] text-[#f2f0eb]'
                  : 'border-[#e4e0d8] bg-white text-[#9a9288] active:border-[#1a1816] active:text-[#1a1816]'
              }`}
            >
              {k === 'today' ? 'วันนี้' : k === 'week' ? 'สัปดาห์นี้' : 'เดือนนี้'}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCustomDateOpen(true)}
            disabled={loading}
            className={`py-2.5 md:py-1.5 px-4 md:px-3.5 rounded-xl md:rounded-lg text-sm md:text-xs font-bold border transition-all font-sans touch-target whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5 ${
              period === 'custom'
                ? 'bg-[#1a1816] border-[#1a1816] text-[#f2f0eb]'
                : 'border-[#e4e0d8] bg-white text-[#9a9288] active:border-[#1a1816] active:text-[#1a1816]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            {period === 'custom' ? dateRangeLabel : 'กำหนดเอง'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-[#9a9288]">
            กำลังโหลดข้อมูล...
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#9a9288]">
            <div className="text-4xl mb-3">📊</div>
            <p>ยังไม่มีข้อมูลออเดอร์ในช่วงเวลานี้</p>
          </div>
        ) : (
          <>
            {/* Date Range Info */}
            <div className="mb-4 text-xs text-[#9a9288]">
              ช่วงวันที่: <span className="font-semibold text-[#6b6358]">{dateRangeLabel}</span>
              <span className="mx-2">·</span>
              {orders.length} ออเดอร์
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(165px,1fr))] gap-3 md:gap-2.5 mb-4">
              {kpis.map((k: ReportKpi, i: number) => (
                <div
                  key={i}
                  className="bg-white border border-[#e4e0d8] rounded-[16px] md:rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <div className="text-xl md:text-lg mb-1">{k.ic}</div>
                  <div className="font-heading text-[26px] md:text-[28px] font-black leading-none mb-1 md:mb-0.5">
                    {k.val}
                  </div>
                  <div className="text-[11px] font-bold text-[#9a9288] uppercase tracking-wider">
                    {k.lbl}
                  </div>
                  <div
                    className={`text-xs md:text-[11px] font-bold mt-1 ${
                      k.dir === 'up' ? 'text-[#16a34a]' : k.dir === 'dn' ? 'text-[#dc2626]' : 'text-[#9a9288]'
                    }`}
                  >
                    {k.dl}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Revenue Chart */}
              <div className="bg-white border border-[#e4e0d8] rounded-[16px] md:rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="text-xs font-bold text-[#6b6358] uppercase tracking-wider mb-3">
                  รายได้รายชั่วโมง
                </div>
                <div className="flex items-end gap-1 h-[100px] md:h-[86px] overflow-x-auto scrollbar-hide">
                  {hours.map((h, i) => (
                    <div key={h} className="flex-1 flex flex-col items-center gap-1 min-w-[24px]">
                      <span className="text-[9px] text-[#9a9288] whitespace-nowrap">{currency}{revenueByHour[i]}</span>
                      <div
                        className="w-full rounded-t-[4px] min-h-[4px] transition-all"
                        style={{
                          height: `${(revenueByHour[i] / maxRev) * 70}px`,
                          background: revenueByHour[i] === maxRev ? '#FA3E3E' : '#d4cfc5',
                        }}
                      />
                      <span className="text-[10px] text-[#9a9288]">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders Chart */}
              <div className="bg-white border border-[#e4e0d8] rounded-[16px] md:rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="text-xs font-bold text-[#6b6358] uppercase tracking-wider mb-3">
                  จำนวนออเดอร์รายชั่วโมง
                </div>
                <div className="flex items-end gap-1 h-[100px] md:h-[86px] overflow-x-auto scrollbar-hide">
                  {hours.map((h, i) => (
                    <div key={h} className="flex-1 flex flex-col items-center gap-1 min-w-[24px]">
                      <span className="text-[9px] text-[#9a9288] whitespace-nowrap">{ordersByHour[i]}</span>
                      <div
                        className="w-full rounded-t-[4px] min-h-[4px] transition-all"
                        style={{
                          height: `${(ordersByHour[i] / maxOrd) * 70}px`,
                          background: ordersByHour[i] === maxOrd ? '#2563eb' : '#d4cfc5',
                        }}
                      />
                      <span className="text-[10px] text-[#9a9288]">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Dishes */}
              <div className="bg-white border border-[#e4e0d8] rounded-[16px] md:rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="text-xs font-bold text-[#6b6358] uppercase tracking-wider mb-3">
                  เมนูขายดี (Top {topDishes.length})
                </div>
                <div className="flex flex-col gap-3 md:gap-2">
                  {topDishes.map((d, i) => (
                    <div key={d.n} className="flex items-center gap-3 md:gap-2">
                      <span className="font-heading text-base md:text-sm font-black text-[#d4cfc5] w-[22px] md:w-[18px] shrink-0 text-center">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm md:text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                          {d.n}
                        </div>
                        <div className="text-xs md:text-[10px] text-[#9a9288]">{d.cnt} จาน</div>
                      </div>
                      <div className="flex-1 h-2 md:h-1.5 bg-[#f7f5f0] rounded-[4px] md:rounded-[3px] max-w-[80px]">
                        <div
                          className="h-full bg-[#FA3E3E] rounded-[4px] md:rounded-[3px]"
                          style={{ width: `${(d.cnt / maxDish) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm md:text-xs font-extrabold text-green-600 font-heading shrink-0">
                        {currency}{d.rev.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white border border-[#e4e0d8] rounded-[16px] md:rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="text-xs font-bold text-[#6b6358] uppercase tracking-wider mb-4 md:mb-3">
                  วิธีชำระเงิน
                </div>
                <div className="flex items-center gap-6 md:gap-4">
                  <div
                    className="w-[100px] h-[100px] md:w-[76px] md:h-[76px] rounded-full shrink-0"
                    style={{
                      background: `conic-gradient(#16a34a 0% ${cashPercentage}%, #2563eb ${cashPercentage}% 100%)`,
                    }}
                  />
                  <div className="flex flex-col gap-3 md:gap-2">
                    <div className="flex items-center gap-2 md:gap-1.5 text-sm md:text-xs">
                      <div className="w-3 h-3 md:w-[9px] md:h-[9px] rounded md:rounded-[3px] bg-[#16a34a] shrink-0" />
                      <span className="flex-1 text-[#6b6358]">เงินสด</span>
                      <span className="font-extrabold font-heading">{cashPercentage}%</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-1.5 text-sm md:text-xs">
                      <div className="w-3 h-3 md:w-[9px] md:h-[9px] rounded md:rounded-[3px] bg-[#2563eb] shrink-0" />
                      <span className="flex-1 text-[#6b6358]">โอนเงิน</span>
                      <span className="font-extrabold font-heading">{bankPercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white border border-[#e4e0d8] rounded-[16px] md:rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="text-xs font-bold text-[#6b6358] uppercase tracking-wider mb-3">
                รายการออเดอร์ล่าสุด
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8]">
                        ออเดอร์
                      </th>
                      <th className="text-left py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8]">
                        วันที่
                      </th>
                      <th className="text-left py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8]">
                        เวลา
                      </th>
                      <th className="text-left py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8]">
                        รายการ
                      </th>
                      <th className="text-right py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8]">
                        ยอด
                      </th>
                      <th className="text-center py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8]">
                        ลบ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#f7f5f0]">
                        <td className="py-2.5 px-2 border-b border-[#e4e0d8] font-bold">#{o.order_number}</td>
                        <td className="py-2.5 px-2 border-b border-[#e4e0d8] text-[#9a9288]">
                          {o.date}
                        </td>
                        <td className="py-2.5 px-2 border-b border-[#e4e0d8] text-[#9a9288]">
                          {o.time}
                        </td>
                        <td className="py-2.5 px-2 border-b border-[#e4e0d8] text-[#6b6358] max-w-[280px] truncate">
                          {o.items}
                        </td>
                        <td className="py-2.5 px-2 border-b border-[#e4e0d8] text-right font-extrabold font-heading">
                          {currency}{o.total.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 border-b border-[#e4e0d8] text-center">
                          <button
                            onClick={() => handleDeleteClick(o.id, o.order_number)}
                            className="p-1.5 rounded-md text-[#9a9288] hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="ลบออเดอร์"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden space-y-3">
                {recentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#f7f5f0] border border-[#e4e0d8] touch-target active:bg-white"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">#{o.order_number}</span>
                        <span className="text-xs text-[#9a9288]">{o.date}</span>
                        <span
                          className={`inline-block py-0.5 px-2 rounded-md text-[10px] font-extrabold ${
                            o.pay === 'cash'
                              ? 'bg-[rgba(22,163,74,0.1)] text-[#16a34a]'
                              : 'bg-[rgba(37,99,235,0.08)] text-[#2563eb]'
                          }`}
                        >
                          {o.pay === 'cash' ? 'เงินสด' : 'โอน'}
                        </span>
                      </div>
                      <div className="text-xs text-[#6b6358] line-clamp-1">{o.items}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className="font-heading text-base font-extrabold text-[#1a1816]">
                        {currency}{o.total.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteClick(o.id, o.order_number)}
                        className="p-2 rounded-full text-[#9a9288] hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="ลบออเดอร์"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Storage Info */}
            <div className="mt-4 p-3 bg-[#f7f5f0] rounded-lg border border-[#e4e0d8] text-xs text-[#9a9288]">
              <p className="flex items-center gap-1.5">
                <span className="text-[#16a34a]">✓</span>
                ข้อมูลถูกบันทึกอย่างปลอดภัยใน Supabase Database
              </p>
              <p className="mt-1 ml-4">
                ข้อมูลไม่มีวันหมดอายุและจะอยู่ในฐานข้อมูลตลาดจนกว่าคุณจะลบออกเอง
              </p>
            </div>
          </>
        )}
      </div>

      {/* Custom Date Range Dialog */}
      <Dialog open={customDateOpen} onOpenChange={setCustomDateOpen}>
        <DialogContent className="sm:max-w-[400px] border-[#e4e0d8]">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#1a1816]">เลือกช่วงวันที่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9a9288]">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#f7f5f0] border border-[#e4e0d8] rounded-lg py-2 px-3 text-[#1a1816] text-sm focus:outline-none focus:border-[#FA3E3E]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9a9288]">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#f7f5f0] border border-[#e4e0d8] rounded-lg py-2 px-3 text-[#1a1816] text-sm focus:outline-none focus:border-[#FA3E3E]"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setCustomDateOpen(false)}
                className="flex-1 border-[#e4e0d8]"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={applyCustomDate}
                disabled={!startDate || !endDate}
                className="flex-1 bg-[#FA3E3E] hover:bg-[#FA3E3E]/90 text-white disabled:opacity-50"
              >
                ใช้งาน
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[360px] border-[#e4e0d8]">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#1a1816] flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              ยืนยันการลบออเดอร์
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-[#6b6358]">
              คุณต้องการลบ <strong>ออเดอร์ #{orderToDelete?.orderNumber}</strong> ใช่หรือไม่?
            </p>
            <p className="text-xs text-[#9a9288]">
              ⚠️ การลบจะลบออเดอร์และรายการอาหารทั้งหมดออกจากระบบ ไม่สามารถกู้คืนได้
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
                className="flex-1 border-[#e4e0d8]"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {deleting ? 'กำลังลบ...' : 'ลบออเดอร์'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions
function toISOTimezone(date: Date): string {
  // Format as YYYY-MM-DD HH:mm:ss in local timezone for Supabase
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getDateRange(
  period: PeriodKey,
  customStart?: string,
  customEnd?: string
): { startDate: string; endDate: string } {
  if (period === 'custom' && customStart && customEnd) {
    const start = new Date(customStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
    return {
      startDate: toISOTimezone(start),
      endDate: toISOTimezone(end),
    };
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(now);

  if (period === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    const day = startDate.getDay();
    const diff = startDate.getDate() - day;
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'month') {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  }

  return {
    startDate: toISOTimezone(startDate),
    endDate: toISOTimezone(endDate),
  };
}

interface CalculatedMetrics {
  kpis: ReportKpi[];
  revenueByHour: number[];
  ordersByHour: number[];
  topDishes: TopDish[];
  cashPercentage: number;
  bankPercentage: number;
  recentOrders: {
    id: string;
    order_number: number;
    date: string;
    time: string;
    items: string;
    pay: 'cash' | 'bank';
    total: number;
  }[];
  hours: string[];
  dateRangeLabel: string;
}

function calculateMetrics(
  orders: OrderWithItems[],
  currency: string,
  period: PeriodKey,
  customStart?: string,
  customEnd?: string
): CalculatedMetrics {
  // Generate date range label
  let dateRangeLabel = '';
  if (period === 'today') {
    dateRangeLabel = new Date().toLocaleDateString('th-TH');
  } else if (period === 'week') {
    dateRangeLabel = 'สัปดาห์นี้';
  } else if (period === 'month') {
    dateRangeLabel = new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
  } else if (period === 'custom' && customStart && customEnd) {
    const start = new Date(customStart).toLocaleDateString('th-TH');
    const end = new Date(customEnd).toLocaleDateString('th-TH');
    dateRangeLabel = start === end ? start : `${start} - ${end}`;
  }

  if (orders.length === 0) {
    return {
      kpis: [],
      revenueByHour: new Array(11).fill(0),
      ordersByHour: new Array(11).fill(0),
      topDishes: [],
      cashPercentage: 0,
      bankPercentage: 0,
      recentOrders: [],
      hours: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
      dateRangeLabel,
    };
  }

  // Calculate totals
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = orders.length;

  // Calculate payment method percentages
  const cashOrders = orders.filter((o) => o.payment_method === 'cash').length;
  const bankOrders = orders.filter((o) => o.payment_method === 'bank').length;
  const cashPercentage = totalOrders > 0 ? Math.round((cashOrders / totalOrders) * 100) : 0;
  const bankPercentage = totalOrders > 0 ? Math.round((bankOrders / totalOrders) * 100) : 0;

  // Calculate top dishes
  const dishMap = new Map<string, { cnt: number; rev: number }>();
  orders.forEach((order) => {
    order.order_items.forEach((item) => {
      const existing = dishMap.get(item.product_name);
      if (existing) {
        existing.cnt += item.qty;
        existing.rev += item.qty * Number(item.price_at_sale);
      } else {
        dishMap.set(item.product_name, {
          cnt: item.qty,
          rev: item.qty * Number(item.price_at_sale),
        });
      }
    });
  });

  const topDishes = Array.from(dishMap.entries())
    .map(([n, { cnt, rev }]) => ({ n, cnt, rev }))
    .sort((a, b) => b.cnt - a.cnt)
    .slice(0, 8);

  const bestDish = topDishes[0]?.n ?? '-';
  const bestDishCount = topDishes[0]?.cnt ?? 0;

  // Hourly breakdown (10am - 8pm)
  const hours = ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
  const revenueByHour = new Array(11).fill(0);
  const ordersByHour = new Array(11).fill(0);

  orders.forEach((order) => {
    const date = new Date(order.created_at);
    const hour = date.getHours();
    const hourIndex = hour - 10; // 10am = index 0
    if (hourIndex >= 0 && hourIndex < 11) {
      revenueByHour[hourIndex] += Number(order.total);
      ordersByHour[hourIndex] += 1;
    }
  });

  // Format recent orders
  const recentOrders = orders
    .slice(0, 10)
    .map((o) => {
      const date = new Date(o.created_at);
      const dateStr = date.toLocaleDateString('th-TH');
      const time = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const items = o.order_items.map((i) => i.product_name).join(', ');
      return {
        id: o.id,
        order_number: o.order_number,
        date: dateStr,
        time,
        items,
        pay: (o.payment_method ?? 'cash') as PaymentMethod,
        total: Number(o.total),
      };
    });

  // Build KPIs
  const kpis: ReportKpi[] = [
    { ic: '💰', val: `${currency}${totalRevenue.toLocaleString()}`, lbl: 'รายได้', dl: `${orders.length} ออเดอร์`, dir: 'fl' },
    { ic: '📋', val: `${totalOrders}`, lbl: 'จำนวนออเดอร์', dl: `เฉลี่ย ${totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0}/ออเดอร์`, dir: 'fl' },
    { ic: '🍽️', val: `${topDishes.reduce((sum, d) => sum + d.cnt, 0)}`, lbl: 'จานทั้งหมด', dl: 'รายการอาหาร', dir: 'fl' },
    { ic: '📈', val: `${currency}${totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0}`, lbl: 'AOV', dl: 'ยอดเฉลี่ยต่อออเดอร์', dir: 'fl' },
    { ic: '🏆', val: bestDish.slice(0, 12) + (bestDish.length > 12 ? '...' : ''), lbl: 'เมนูขายดี', dl: `${bestDishCount} จาน`, dir: 'fl' },
    { ic: '💵', val: `${cashPercentage}%`, lbl: 'เงินสด', dl: `${cashOrders} ออเดอร์`, dir: 'fl' },
  ];

  return {
    kpis,
    revenueByHour,
    ordersByHour,
    topDishes,
    cashPercentage,
    bankPercentage,
    recentOrders,
    hours,
    dateRangeLabel,
  };
}
