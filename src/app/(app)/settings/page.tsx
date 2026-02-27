'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeSection = SECTIONS.find((s) => s.id === active);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[#e4e0d8] bg-white px-4 md:px-5 py-3 md:py-3.5">
        {/* Mobile Header with Back Button */}
        <div className="md:hidden flex items-center gap-3">
          {!mobileMenuOpen && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-1 text-sm text-[#9a9288] touch-target"
            >
              <ChevronLeft className="w-4 h-4" />
              เมนู
            </button>
          )}
          <div className="flex-1">
            <h2 className="font-heading text-lg font-black leading-none mb-0.5 flex items-center gap-2">
              {mobileMenuOpen ? 'ตั้งค่าระบบ' : (
                <>
                  <span>{activeSection?.icon}</span>
                  {activeSection?.label}
                </>
              )}
            </h2>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <h2 className="font-heading text-xl font-black leading-none mb-0.5">
            ตั้งค่าระบบ
          </h2>
          <p className="text-xs text-[#9a9288]">การตั้งค่าร้านอาหาร ผู้ใช้งาน และข้อมูล</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto md:p-4 momentum-scroll">
        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-[170px_1fr] gap-4">
          <nav className="flex flex-col gap-0.5 sticky top-0">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold cursor-pointer border-none text-left transition-all touch-target ${
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
            <SettingsContent active={active} />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {mobileMenuOpen ? (
            // Mobile Menu List
            <div className="p-4 space-y-2">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setActive(s.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between py-4 px-4 rounded-xl text-left transition-all touch-target ${
                    active === s.id
                      ? 'bg-[rgba(212,128,10,0.1)] text-[#d4800a]'
                      : 'bg-white border border-[#e4e0d8] text-[#1a1816]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{s.icon}</span>
                    <span className="font-bold text-sm">{s.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#9a9288]" />
                </button>
              ))}
            </div>
          ) : (
            // Mobile Content
            <div className="p-4">
              <SettingsContent active={active} isMobile />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsContent({ active, isMobile = false }: { active: SectionId; isMobile?: boolean }) {
  const cardClass = `bg-white border border-[#e4e0d8] rounded-[16px] md:rounded-[14px] ${isMobile ? 'p-4 mb-4' : 'p-4 mb-3'}`;
  const sectionTitleClass = `font-extrabold ${isMobile ? 'text-sm mb-4 pb-3' : 'text-[13px] mb-3.5 pb-2.5'} border-b border-[#e4e0d8]`;
  const labelClass = `block font-bold text-[#9a9288] uppercase tracking-wider mb-1.5 ${isMobile ? 'text-xs' : 'text-[10px]'}`;
  const inputClass = `w-full bg-[#f7f5f0] border border-[#e4e0d8] rounded-lg ${isMobile ? 'py-3 px-3 text-sm' : 'py-2 px-3 text-[13px]'} text-[#1a1816] focus:outline-none focus:border-[#d4800a] touch-target`;
  const btnClass = `bg-[#d4800a] border-none rounded-lg py-3 md:py-2 px-5 text-white font-extrabold cursor-pointer hover:opacity-90 touch-target ${isMobile ? 'text-sm w-full' : 'text-xs'}`;
  const toggleBtnClass = `w-11 h-6 rounded-full bg-[#16a34a] border-none cursor-pointer relative transition-colors`;
  const toggleKnobClass = `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform translate-x-5`;

  return (
    <>
      {active === 'general' && (
        <>
          <div className={cardClass}>
            <div className={sectionTitleClass}>ข้อมูลร้านอาหาร</div>
            <div className="mb-4">
              <label className={labelClass}>ชื่อร้าน</label>
              <input type="text" defaultValue="ร้านอาหารครัวไทย" className={inputClass} />
            </div>
            <div className="mb-4">
              <label className={labelClass}>ที่อยู่</label>
              <input type="text" defaultValue="ภูเก็ต ประเทศไทย" className={inputClass} />
            </div>
            <div className="mb-4">
              <label className={labelClass}>เบอร์โทรศัพท์</label>
              <input type="text" defaultValue="+66 76 123 456" className={`${inputClass} max-w-[220px]`} />
            </div>
            <button type="button" className={btnClass}>บันทึก</button>
          </div>
          <div className={cardClass}>
            <div className={sectionTitleClass}>ค่าระบบ</div>
            <div className={`flex items-center justify-between ${isMobile ? 'py-4' : 'py-2.5'} border-b border-[#e4e0d8]`}>
              <div>
                <div className={`${isMobile ? 'text-sm' : 'text-[13px]'} font-semibold`}>เสียงเมื่อได้รับออเดอร์</div>
                <div className={`${isMobile ? 'text-xs' : 'text-[11px]'} text-[#9a9288] mt-0.5`}>แจ้งเตือนเสียงเมื่อออเดอร์ใหม่มาถึง</div>
              </div>
              <button type="button" className={toggleBtnClass} aria-label="Toggle">
                <span className={toggleKnobClass} />
              </button>
            </div>
            <div className={`flex items-center justify-between ${isMobile ? 'py-4' : 'py-2.5'}`}>
              <div>
                <div className={`${isMobile ? 'text-sm' : 'text-[13px]'} font-semibold`}>แสดงยอดขายบนการ์ดเมนู</div>
                <div className={`${isMobile ? 'text-xs' : 'text-[11px]'} text-[#9a9288] mt-0.5`}>แสดงจำนวนที่ขายในวันนี้</div>
              </div>
              <button type="button" className={toggleBtnClass} aria-label="Toggle">
                <span className={toggleKnobClass} />
              </button>
            </div>
          </div>
        </>
      )}

      {active === 'users' && (
        <div className={cardClass}>
          <div className={`${sectionTitleClass} flex items-center justify-between`}>
            พนักงานทั้งหมด
            <button
              type="button"
              className={`flex items-center gap-1 bg-[#d4800a] border-none rounded-lg text-white font-extrabold cursor-pointer ${isMobile ? 'py-2 px-3 text-xs' : 'py-1 px-2.5 text-[11px]'}`}
            >
              {isMobile ? <UserPlus className="w-4 h-4" /> : '+'}
              {isMobile ? 'เชิญ' : 'เชิญ'}
            </button>
          </div>
          <div className="space-y-3">
            {STAFF.map((u) => (
              <div
                key={u.e}
                className={`flex items-center gap-3 ${isMobile ? 'p-3' : 'p-2.5'} rounded-[12px] md:rounded-[10px] bg-[#f7f5f0] border border-[#e4e0d8] touch-target`}
              >
                <div
                  className={`${isMobile ? 'w-10 h-10' : 'w-8 h-8'} rounded-full flex items-center justify-center font-extrabold ${isMobile ? 'text-sm' : 'text-xs'} font-heading`}
                  style={{ background: u.bg, color: u.c }}
                >
                  {u.n[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`${isMobile ? 'text-sm' : 'text-[13px]'} font-bold truncate`}>{u.n}</div>
                  <div className={`${isMobile ? 'text-xs' : 'text-[11px]'} text-[#9a9288] truncate`}>{u.e}</div>
                </div>
                <span
                  className={`py-1 md:py-0.5 px-2 md:px-2 rounded-md ${isMobile ? 'text-xs' : 'text-[10px]'} font-extrabold shrink-0 ${
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
        <div className={cardClass}>
          <div className={sectionTitleClass}>ภาษีและสกุลเงิน</div>
          <div className="mb-4">
            <label className={labelClass}>สัญลักษณ์สกุลเงิน</label>
            <input type="text" defaultValue="฿" className={`${inputClass} w-[130px]`} />
          </div>
          <div className="mb-4">
            <label className={labelClass}>อัตราภาษี VAT (%)</label>
            <input type="number" defaultValue={7} className={`${inputClass} w-[130px]`} />
          </div>
          <div className={`flex items-center justify-between ${isMobile ? 'py-4' : 'py-2.5'} border-b border-[#e4e0d8]`}>
            <div className={`${isMobile ? 'text-sm' : 'text-[13px]'} font-semibold`}>ราคารวม VAT แล้ว</div>
            <button type="button" className={toggleBtnClass} aria-label="Toggle">
              <span className={toggleKnobClass} />
            </button>
          </div>
          <button type="button" className={`${btnClass} mt-4`}>บันทึก</button>
        </div>
      )}

      {active === 'data' && (
        <div className={cardClass}>
          <div className={sectionTitleClass}>ข้อมูลและการสำรอง</div>
          <div className={`flex items-center justify-between ${isMobile ? 'py-4' : 'py-2.5'} border-b border-[#e4e0d8]`}>
            <div>
              <div className={`${isMobile ? 'text-sm' : 'text-[13px]'} font-semibold`}>ส่งออกออเดอร์ทั้งหมด</div>
              <div className={`${isMobile ? 'text-xs' : 'text-[11px]'} text-[#9a9288] mt-0.5`}>ดาวน์โหลด CSV ประวัติทั้งหมด</div>
            </div>
            <button
              type="button"
              className={`py-2.5 md:py-2 px-4 md:px-3 rounded-lg border border-[#e4e0d8] bg-transparent text-[#9a9288] font-bold cursor-pointer touch-target ${isMobile ? 'text-sm' : 'text-xs'}`}
            >
              ดาวน์โหลด
            </button>
          </div>
          <div className={`flex items-center justify-between ${isMobile ? 'py-4' : 'py-2.5'} border-b border-[#e4e0d8]`}>
            <div className={`${isMobile ? 'text-sm' : 'text-[13px]'} font-semibold`}>ส่งออกรายการเมนู</div>
            <button
              type="button"
              className={`py-2.5 md:py-2 px-4 md:px-3 rounded-lg border border-[#e4e0d8] bg-transparent text-[#9a9288] font-bold cursor-pointer touch-target ${isMobile ? 'text-sm' : 'text-xs'}`}
            >
              ดาวน์โหลด
            </button>
          </div>
          <div className={`flex items-center justify-between ${isMobile ? 'py-4' : 'py-2.5'}`}>
            <div className={`${isMobile ? 'text-sm' : 'text-[13px]'} font-semibold`}>นำเข้าเมนูจาก CSV</div>
            <button
              type="button"
              className={`py-2.5 md:py-2 px-4 md:px-3 rounded-lg border border-[#e4e0d8] bg-transparent text-[#9a9288] font-bold cursor-pointer touch-target ${isMobile ? 'text-sm' : 'text-xs'}`}
            >
              อัปโหลด
            </button>
          </div>
        </div>
      )}

      {active === 'tech' && (
        <div className={cardClass}>
          <div className={sectionTitleClass}>Tech Stack</div>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="text-left py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase border-b border-[#e4e0d8]">Layer</th>
                  <th className="text-left py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase border-b border-[#e4e0d8]">Technology</th>
                  <th className="text-left py-2 px-2 text-[10px] font-bold text-[#9a9288] uppercase border-b border-[#e4e0d8]">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {TECH_ROWS.map((r) => (
                  <tr key={r.layer}>
                    <td className="py-2.5 px-2 border-b border-[#e4e0d8]">{r.layer}</td>
                    <td className="py-2.5 px-2 border-b border-[#e4e0d8] font-bold">{r.tech}</td>
                    <td className="py-2.5 px-2 border-b border-[#e4e0d8]">{r.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {TECH_ROWS.map((r) => (
              <div key={r.layer} className="p-3 rounded-xl bg-[#f7f5f0] border border-[#e4e0d8]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#9a9288] font-bold">{r.layer}</span>
                  <span className="text-sm font-bold text-[#1a1816]">{r.tech}</span>
                </div>
                <div className="text-xs text-[#6b6358]">{r.purpose}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
