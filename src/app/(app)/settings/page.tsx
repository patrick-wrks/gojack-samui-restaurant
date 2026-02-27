'use client';

import { useState } from 'react';
import { STAFF } from '@/lib/constants';

const SECTIONS = [
  { id: 'general', label: 'ข้อมูลร้าน', icon: '🏪' },
  { id: 'users', label: 'พนักงาน', icon: '👥' },
  { id: 'tax', label: 'ภาษี / สกุลเงิน', icon: '🧾' },
  { id: 'data', label: 'ข้อมูล & สำรอง', icon: '💾' },
  { id: 'tech', label: 'Tech Stack', icon: '🧱' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

const TECH_ROWS = [
  { layer: 'Frontend', tech: 'Next.js 15', purpose: 'App framework' },
  { layer: 'Styling', tech: 'Tailwind + shadcn/ui', purpose: 'UI components' },
  { layer: 'Database', tech: 'PostgreSQL (Supabase)', purpose: 'Hosted DB' },
  { layer: 'Auth', tech: 'Client session', purpose: 'Login / demo' },
  { layer: 'Hosting', tech: 'Cloudflare Pages', purpose: 'CDN deploy' },
  { layer: 'Repo', tech: 'GitHub', purpose: 'CI/CD' },
];

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>('general');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="shrink-0 border-b border-[#e4e0d8] bg-white px-5 py-3.5">
        <h2 className="font-heading text-xl font-black leading-none mb-0.5">
          ตั้งค่าระบบ
        </h2>
        <p className="text-xs text-[#9a9288]">การตั้งค่าร้านอาหาร ผู้ใช้งาน และข้อมูล</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-[170px_1fr] gap-4">
        <nav className="flex flex-col gap-0.5 sticky top-0">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold cursor-pointer border-none text-left transition-all ${
                active === s.id
                  ? 'bg-[rgba(212,128,10,0.1)] text-[#d4800a]'
                  : 'bg-transparent text-[#9a9288] hover:bg-white hover:text-[#1a1816]'
              }`}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>
        <div>
          {active === 'general' && (
            <>
              <div className="bg-white border border-[#e4e0d8] rounded-[14px] p-4 mb-3">
                <div className="text-[13px] font-extrabold mb-3.5 pb-2.5 border-b border-[#e4e0d8]">
                  ข้อมูลร้านอาหาร
                </div>
                <div className="mb-3">
                  <label className="block text-[10px] font-bold text-[#9a9288] uppercase tracking-wider mb-1.5">
                    ชื่อร้าน
                  </label>
                  <input
                    type="text"
                    defaultValue="ร้านอาหารครัวไทย"
                    className="w-full bg-[#f7f5f0] border border-[#e4e0d8] rounded-lg py-2 px-3 text-[13px] text-[#1a1816] focus:outline-none focus:border-[#d4800a]"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-[10px] font-bold text-[#9a9288] uppercase tracking-wider mb-1.5">
                    ที่อยู่
                  </label>
                  <input
                    type="text"
                    defaultValue="ภูเก็ต ประเทศไทย"
                    className="w-full bg-[#f7f5f0] border border-[#e4e0d8] rounded-lg py-2 px-3 text-[13px] text-[#1a1816] focus:outline-none focus:border-[#d4800a]"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-[10px] font-bold text-[#9a9288] uppercase tracking-wider mb-1.5">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    defaultValue="+66 76 123 456"
                    className="w-full max-w-[220px] bg-[#f7f5f0] border border-[#e4e0d8] rounded-lg py-2 px-3 text-[13px] text-[#1a1816] focus:outline-none focus:border-[#d4800a]"
                  />
                </div>
                <button
                  type="button"
                  className="bg-[#d4800a] border-none rounded-lg py-2 px-5 text-white text-xs font-extrabold cursor-pointer mt-3 hover:opacity-90"
                >
                  บันทึก
                </button>
              </div>
              <div className="bg-white border border-[#e4e0d8] rounded-[14px] p-4">
                <div className="text-[13px] font-extrabold mb-3.5 pb-2.5 border-b border-[#e4e0d8]">
                  ค่าระบบ
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-[#e4e0d8]">
                  <div>
                    <div className="text-[13px] font-semibold">เสียงเมื่อได้รับออเดอร์</div>
                    <div className="text-[11px] text-[#9a9288] mt-0.5">
                      แจ้งเตือนเสียงเมื่อออเดอร์ใหม่มาถึง
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-8 h-[18px] rounded-[9px] bg-[#16a34a] border-none cursor-pointer"
                    aria-label="Toggle"
                  />
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-[#e4e0d8]">
                  <div>
                    <div className="text-[13px] font-semibold">แสดงยอดขายบนการ์ดเมนู</div>
                    <div className="text-[11px] text-[#9a9288] mt-0.5">
                      แสดงจำนวนที่ขายในวันนี้
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-8 h-[18px] rounded-[9px] bg-[#16a34a] border-none cursor-pointer"
                    aria-label="Toggle"
                  />
                </div>
              </div>
            </>
          )}
          {active === 'users' && (
            <div className="bg-white border border-[#e4e0d8] rounded-[14px] p-4">
              <div className="text-[13px] font-extrabold mb-3.5 pb-2.5 border-b border-[#e4e0d8] flex items-center justify-between">
                พนักงานทั้งหมด
                <button
                  type="button"
                  className="bg-[#d4800a] border-none rounded-lg py-1 px-2.5 text-white text-[11px] font-extrabold cursor-pointer"
                >
                  + เชิญ
                </button>
              </div>
              <div className="space-y-1.5">
                {STAFF.map((u) => (
                  <div
                    key={u.e}
                    className="flex items-center gap-2.5 p-2.5 rounded-[10px] bg-[#f7f5f0] border border-[#e4e0d8]"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs font-heading"
                      style={{ background: u.bg, color: u.c }}
                    >
                      {u.n[0]}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold">{u.n}</div>
                      <div className="text-[11px] text-[#9a9288]">{u.e}</div>
                    </div>
                    <span
                      className={`ml-auto py-0.5 px-2 rounded-md text-[10px] font-extrabold ${
                        u.r === 'Admin'
                          ? 'bg-[rgba(245,166,35,0.15)] text-[#d4800a]'
                          : u.r === 'Manager'
                            ? 'bg-[rgba(59,130,246,0.1)] text-[#2563eb]'
                            : 'bg-[rgba(107,114,128,0.15)] text-[#9a9288]'
                      }`}
                    >
                      {u.r}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {active === 'tax' && (
            <div className="bg-white border border-[#e4e0d8] rounded-[14px] p-4">
              <div className="text-[13px] font-extrabold mb-3.5 pb-2.5 border-b border-[#e4e0d8]">
                ภาษีและสกุลเงิน
              </div>
              <div className="mb-3">
                <label className="block text-[10px] font-bold text-[#9a9288] uppercase tracking-wider mb-1.5">
                  สัญลักษณ์สกุลเงิน
                </label>
                <input
                  type="text"
                  defaultValue="฿"
                  className="w-[130px] bg-[#f7f5f0] border border-[#e4e0d8] rounded-lg py-2 px-3 text-[13px] focus:outline-none focus:border-[#d4800a]"
                />
              </div>
              <div className="mb-3">
                <label className="block text-[10px] font-bold text-[#9a9288] uppercase tracking-wider mb-1.5">
                  อัตราภาษี VAT (%)
                </label>
                <input
                  type="number"
                  defaultValue={7}
                  className="w-[130px] bg-[#f7f5f0] border border-[#e4e0d8] rounded-lg py-2 px-3 text-[13px] focus:outline-none focus:border-[#d4800a]"
                />
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-[#e4e0d8]">
                <div className="text-[13px] font-semibold">ราคารวม VAT แล้ว</div>
                <button
                  type="button"
                  className="w-8 h-[18px] rounded-[9px] bg-[#16a34a] border-none cursor-pointer"
                  aria-label="Toggle"
                />
              </div>
              <button
                type="button"
                className="bg-[#d4800a] border-none rounded-lg py-2 px-5 text-white text-xs font-extrabold cursor-pointer mt-3 hover:opacity-90"
              >
                บันทึก
              </button>
            </div>
          )}
          {active === 'data' && (
            <div className="bg-white border border-[#e4e0d8] rounded-[14px] p-4">
              <div className="text-[13px] font-extrabold mb-3.5 pb-2.5 border-b border-[#e4e0d8]">
                ข้อมูลและการสำรอง
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-[#e4e0d8]">
                <div>
                  <div className="text-[13px] font-semibold">ส่งออกออเดอร์ทั้งหมด</div>
                  <div className="text-[11px] text-[#9a9288] mt-0.5">
                    ดาวน์โหลด CSV ประวัติทั้งหมด
                  </div>
                </div>
                <button
                  type="button"
                  className="py-2 px-3 rounded-lg border border-[#e4e0d8] bg-transparent text-[#9a9288] text-xs font-bold cursor-pointer"
                >
                  ดาวน์โหลด
                </button>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-[#e4e0d8]">
                <div className="text-[13px] font-semibold">ส่งออกรายการเมนู</div>
                <button
                  type="button"
                  className="py-2 px-3 rounded-lg border border-[#e4e0d8] bg-transparent text-[#9a9288] text-xs font-bold cursor-pointer"
                >
                  ดาวน์โหลด
                </button>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div className="text-[13px] font-semibold">นำเข้าเมนูจาก CSV</div>
                <button
                  type="button"
                  className="py-2 px-3 rounded-lg border border-[#e4e0d8] bg-transparent text-[#9a9288] text-xs font-bold cursor-pointer"
                >
                  อัปโหลด
                </button>
              </div>
            </div>
          )}
          {active === 'tech' && (
            <div className="bg-white border border-[#e4e0d8] rounded-[14px] p-4">
              <div className="text-[13px] font-extrabold mb-3.5 pb-2.5 border-b border-[#e4e0d8]">
                Tech Stack
              </div>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase border-b border-[#e4e0d8]">
                      Layer
                    </th>
                    <th className="text-left py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase border-b border-[#e4e0d8]">
                      Technology
                    </th>
                    <th className="text-left py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase border-b border-[#e4e0d8]">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TECH_ROWS.map((r) => (
                    <tr key={r.layer}>
                      <td className="py-2.5 px-2 border-b border-[#e4e0d8]">{r.layer}</td>
                      <td className="py-2.5 px-2 border-b border-[#e4e0d8] font-bold">
                        {r.tech}
                      </td>
                      <td className="py-2.5 px-2 border-b border-[#e4e0d8]">{r.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
