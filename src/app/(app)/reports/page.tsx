'use client';

import { useState, useCallback } from 'react';
import { KPIS, HOURS, R_H, O_H, TOP_DISHES, SAMPLE_ORDERS } from '@/lib/constants';
import { useOrdersRealtime } from '@/hooks/useOrdersRealtime';
import type { ReportKpi } from '@/types/pos';

type PeriodKey = 'today' | 'week' | 'month';

export default function ReportsPage() {
  const [period, setPeriod] = useState<PeriodKey>('today');
  const [, setRefresh] = useState(0);
  useOrdersRealtime(
    useCallback(() => {
      setRefresh((n) => n + 1);
    }, [])
  );
  const kpis = KPIS[period] ?? KPIS.today;
  const maxRev = Math.max(...R_H);
  const maxOrd = Math.max(...O_H);
  const maxDish = TOP_DISHES[0]?.cnt ?? 1;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="shrink-0 border-b border-[#e4e0d8] bg-white px-5 py-3.5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading text-xl font-black leading-none mb-0.5">
              รายงาน & วิเคราะห์
            </h2>
            <p className="text-xs text-[#9a9288]">ยอดขาย จำนวนออเดอร์ เมนูขายดี และอื่นๆ</p>
          </div>
          <button
            type="button"
            className="py-2 px-3 rounded-lg border border-[#e4e0d8] bg-transparent text-[#9a9288] text-xs font-bold hover:border-[#1a1816] hover:text-[#1a1816] transition-colors"
          >
            ⬇ ส่งออก CSV
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">
        <div className="flex gap-1 mb-4 flex-wrap">
          {(['today', 'week', 'month'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setPeriod(k)}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold border transition-all font-sans cursor-pointer ${
                period === k
                  ? 'bg-[#1a1816] border-[#1a1816] text-[#f2f0eb]'
                  : 'border-[#e4e0d8] bg-transparent text-[#9a9288] hover:border-[#1a1816] hover:text-[#1a1816]'
              }`}
            >
              {k === 'today' ? 'วันนี้' : k === 'week' ? 'สัปดาห์นี้' : 'เดือนนี้'}
            </button>
          ))}
          <button
            type="button"
            className="py-1.5 px-3.5 rounded-lg text-xs font-bold border border-[#e4e0d8] bg-transparent text-[#9a9288] cursor-pointer"
          >
            กำหนดเอง
          </button>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(165px,1fr))] gap-2.5 mb-4">
          {kpis.map((k: ReportKpi, i: number) => (
            <div
              key={i}
              className="bg-white border border-[#e4e0d8] rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <div className="text-lg mb-1">{k.ic}</div>
              <div className="font-heading text-[28px] font-black leading-none mb-0.5">
                {k.val}
              </div>
              <div className="text-[10px] font-bold text-[#9a9288] uppercase tracking-wider">
                {k.lbl}
              </div>
              <div
                className={`text-[11px] font-bold mt-1 ${
                  k.dir === 'up' ? 'text-[#16a34a]' : k.dir === 'dn' ? 'text-[#dc2626]' : 'text-[#9a9288]'
                }`}
              >
                {k.dl}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="bg-white border border-[#e4e0d8] rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="text-xs font-bold text-[#6b6358] uppercase tracking-wider mb-3">
              รายได้รายชั่วโมง
            </div>
            <div className="flex items-end gap-1 h-[86px]">
              {HOURS.map((h, i) => (
                <div key={h} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[9px] text-[#9a9288]">฿{R_H[i]}</span>
                  <div
                    className="w-full rounded-t-[3px] min-h-[3px] transition-all"
                    style={{
                      height: `${(R_H[i] / maxRev) * 78}px`,
                      background: R_H[i] === maxRev ? '#d4800a' : '#d4cfc5',
                    }}
                  />
                  <span className="text-[9px] text-[#9a9288]">{h}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-[#e4e0d8] rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="text-xs font-bold text-[#6b6358] uppercase tracking-wider mb-3">
              จำนวนออเดอร์รายชั่วโมง
            </div>
            <div className="flex items-end gap-1 h-[86px]">
              {HOURS.map((h, i) => (
                <div key={h} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[9px] text-[#9a9288]">{O_H[i]}</span>
                  <div
                    className="w-full rounded-t-[3px] min-h-[3px] transition-all"
                    style={{
                      height: `${(O_H[i] / maxOrd) * 78}px`,
                      background: O_H[i] === maxOrd ? '#2563eb' : '#d4cfc5',
                    }}
                  />
                  <span className="text-[9px] text-[#9a9288]">{h}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-[#e4e0d8] rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="text-xs font-bold text-[#6b6358] uppercase tracking-wider mb-3">
              เมนูขายดี (Top 8)
            </div>
            <div className="flex flex-col gap-2">
              {TOP_DISHES.map((d, i) => (
                <div key={d.n} className="flex items-center gap-2">
                  <span className="font-heading text-sm font-black text-[#d4cfc5] w-[18px] shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                      {d.n}
                    </div>
                    <div className="text-[10px] text-[#9a9288]">{d.cnt} จาน</div>
                  </div>
                  <div className="flex-1 h-1.5 bg-[#f7f5f0] rounded-[3px]">
                    <div
                      className="h-full bg-[#d4800a] rounded-[3px]"
                      style={{ width: `${(d.cnt / maxDish) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-[#d4800a] font-heading shrink-0">
                    ฿{d.rev.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-[#e4e0d8] rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="text-xs font-bold text-[#6b6358] uppercase tracking-wider mb-3">
              วิธีชำระเงิน
            </div>
            <div className="flex items-center gap-4">
              <div
                className="w-[76px] h-[76px] rounded-full shrink-0"
                style={{
                  background: 'conic-gradient(#16a34a 0% 65%, #2563eb 65% 100%)',
                }}
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-[9px] h-[9px] rounded-[3px] bg-[#16a34a] shrink-0" />
                  <span className="flex-1 text-[#6b6358]">เงินสด</span>
                  <span className="font-extrabold font-heading">65%</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-[9px] h-[9px] rounded-[3px] bg-[#2563eb] shrink-0" />
                  <span className="flex-1 text-[#6b6358]">โอนเงิน</span>
                  <span className="font-extrabold font-heading">35%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e4e0d8] rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="text-xs font-bold text-[#6b6358] uppercase tracking-wider mb-3">
            รายการออเดอร์ล่าสุด
          </div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="text-left py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8]">
                  ออเดอร์
                </th>
                <th className="text-left py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8]">
                  เวลา
                </th>
                <th className="text-left py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8]">
                  รายการ
                </th>
                <th className="text-left py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8]">
                  ลูกค้า
                </th>
                <th className="text-left py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8]">
                  ชำระ
                </th>
                <th className="text-right py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8]">
                  ยอด
                </th>
              </tr>
            </thead>
            <tbody>
              {[...SAMPLE_ORDERS].reverse().map((o) => (
                <tr key={o.id} className="hover:bg-[#f7f5f0]">
                  <td className="py-2.5 px-2 border-b border-[#e4e0d8] font-bold">{o.id}</td>
                  <td className="py-2.5 px-2 border-b border-[#e4e0d8] text-[#9a9288]">
                    {o.time}
                  </td>
                  <td className="py-2.5 px-2 border-b border-[#e4e0d8] text-[#6b6358] max-w-[220px] truncate">
                    {o.items}
                  </td>
                  <td className="py-2.5 px-2 border-b border-[#e4e0d8] text-center">
                    {o.cust}
                  </td>
                  <td className="py-2.5 px-2 border-b border-[#e4e0d8]">
                    <span
                      className={`inline-block py-0.5 px-2 rounded-md text-[10px] font-extrabold ${
                        o.pay === 'cash'
                          ? 'bg-[rgba(22,163,74,0.1)] text-[#16a34a]'
                          : 'bg-[rgba(37,99,235,0.08)] text-[#2563eb]'
                      }`}
                    >
                      {o.pay === 'cash' ? 'เงินสด' : 'โอน'}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 border-b border-[#e4e0d8] text-right font-extrabold font-heading">
                    ฿{o.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
