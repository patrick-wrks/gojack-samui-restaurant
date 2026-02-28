'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStoreSettingsStore } from '@/store/store-settings-store';
import { updateStore } from '@/lib/store-settings';

const SECTIONS = [
  { id: 'general', label: 'ข้อมูลร้าน', icon: '🏪' },
  { id: 'payment', label: 'การชำระเงิน', icon: '💳' },
  { id: 'tax', label: 'ภาษี / สกุลเงิน', icon: '🧾' },
  { id: 'data', label: 'ข้อมูล & สำรอง', icon: '💾' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];


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
  const { store, loadStore } = useStoreSettingsStore();
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('฿');
  const [taxRate, setTaxRate] = useState(7);
  const [pricesIncludeTax, setPricesIncludeTax] = useState(true);
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [generalSaving, setGeneralSaving] = useState(false);
  const [taxSaving, setTaxSaving] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);

  useEffect(() => {
    if (store) {
      setStoreName(store.store_name);
      setStoreAddress(store.store_address);
      setStorePhone(store.store_phone);
      setCurrencySymbol(store.currency_symbol);
      setTaxRate(store.tax_rate);
      setPricesIncludeTax(store.prices_include_tax);
      setBankName(store.bank_name);
      setBankAccountNumber(store.bank_account_number);
      setBankAccountName(store.bank_account_name);
    }
  }, [store]);

  const cardClass = `bg-white border border-[#e4e0d8] rounded-[16px] md:rounded-[14px] ${isMobile ? 'p-4 mb-4' : 'p-4 mb-3'}`;
  const sectionTitleClass = `font-extrabold ${isMobile ? 'text-sm mb-4 pb-3' : 'text-[13px] mb-3.5 pb-2.5'} border-b border-[#e4e0d8]`;
  const labelClass = `block font-bold text-[#9a9288] uppercase tracking-wider mb-1.5 ${isMobile ? 'text-xs' : 'text-[10px]'}`;
  const inputClass = `w-full bg-[#f7f5f0] border border-[#e4e0d8] rounded-lg ${isMobile ? 'py-3 px-3 text-sm' : 'py-2 px-3 text-[13px]'} text-[#1a1816] focus:outline-none focus:border-[#d4800a] touch-target`;
  const btnClass = `bg-[#d4800a] border-none rounded-lg py-3 md:py-2 px-5 text-white font-extrabold cursor-pointer hover:opacity-90 touch-target disabled:opacity-60 ${isMobile ? 'text-sm w-full' : 'text-xs'}`;
  const toggleBtnClass = `inline-flex shrink-0 h-6 w-11 min-w-[2.75rem] rounded-full border-none cursor-pointer relative transition-colors`;
  const toggleKnobClass = `absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-out`;

  const handleSaveGeneral = async () => {
    setGeneralSaving(true);
    const updated = await updateStore({ store_name: storeName, store_address: storeAddress, store_phone: storePhone });
    setGeneralSaving(false);
    if (updated) await loadStore();
  };

  const handleSaveTax = async () => {
    setTaxSaving(true);
    const updated = await updateStore({ currency_symbol: currencySymbol.trim() || '฿', tax_rate: taxRate, prices_include_tax: pricesIncludeTax });
    setTaxSaving(false);
    if (updated) await loadStore();
  };

  const handleSaveBank = async () => {
    setBankSaving(true);
    const updated = await updateStore({
      bank_name: bankName.trim(),
      bank_account_number: bankAccountNumber.trim(),
      bank_account_name: bankAccountName.trim(),
    });
    setBankSaving(false);
    if (updated) await loadStore();
  };

  return (
    <>
      {active === 'general' && (
        <>
          <div className={cardClass}>
            <div className={sectionTitleClass}>ข้อมูลร้านอาหาร</div>
            <div className="mb-4">
              <label className={labelClass}>ชื่อร้าน</label>
              <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className={inputClass} />
            </div>
            <div className="mb-4">
              <label className={labelClass}>ที่อยู่</label>
              <input type="text" value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} className={inputClass} />
            </div>
            <div className="mb-4">
              <label className={labelClass}>เบอร์โทรศัพท์</label>
              <input type="text" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} className={`${inputClass} max-w-[220px]`} />
            </div>
            <button type="button" onClick={handleSaveGeneral} disabled={generalSaving} className={btnClass}>
              {generalSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
          <div className={cardClass}>
            <div className={sectionTitleClass}>ค่าระบบ</div>
            <div className={`flex items-center justify-between ${isMobile ? 'py-4' : 'py-2.5'} border-b border-[#e4e0d8]`}>
              <div>
                <div className={`${isMobile ? 'text-sm' : 'text-[13px]'} font-semibold`}>เสียงเมื่อได้รับออเดอร์</div>
                <div className={`${isMobile ? 'text-xs' : 'text-[11px]'} text-[#9a9288] mt-0.5`}>แจ้งเตือนเสียงเมื่อออเดอร์ใหม่มาถึง</div>
              </div>
              <button type="button" className={toggleBtnClass} aria-label="Toggle">
                <span className={`${toggleKnobClass} translate-x-5`} />
              </button>
            </div>
            <div className={`flex items-center justify-between ${isMobile ? 'py-4' : 'py-2.5'}`}>
              <div>
                <div className={`${isMobile ? 'text-sm' : 'text-[13px]'} font-semibold`}>แสดงยอดขายบนการ์ดเมนู</div>
                <div className={`${isMobile ? 'text-xs' : 'text-[11px]'} text-[#9a9288] mt-0.5`}>แสดงจำนวนที่ขายในวันนี้</div>
              </div>
              <button type="button" className={toggleBtnClass} aria-label="Toggle">
                <span className={`${toggleKnobClass} translate-x-5`} />
              </button>
            </div>
          </div>
        </>
      )}

      {active === 'payment' && (
        <div className={cardClass}>
          <div className={sectionTitleClass}>บัญชีธนาคารสำหรับรับโอน</div>
          <div className="mb-4">
            <label className={labelClass}>ชื่อธนาคาร</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="เช่น กสิกรไทย, ไทยพาณิชย์"
              className={inputClass}
            />
          </div>
          <div className="mb-4">
            <label className={labelClass}>เลขที่บัญชี</label>
            <input
              type="text"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              placeholder="XXX-X-XXXXX-X"
              className={`${inputClass} max-w-[280px]`}
            />
          </div>
          <div className="mb-4">
            <label className={labelClass}>ชื่อบัญชี</label>
            <input
              type="text"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              placeholder="ชื่อที่ปรากฏในบัญชี"
              className={inputClass}
            />
          </div>
          <button type="button" onClick={handleSaveBank} disabled={bankSaving} className={btnClass}>
            {bankSaving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      )}

      {active === 'tax' && (
        <div className={cardClass}>
          <div className={sectionTitleClass}>ภาษีและสกุลเงิน</div>
          <div className="mb-4">
            <label className={labelClass}>สัญลักษณ์สกุลเงิน</label>
            <input type="text" value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} className={`${inputClass} w-[130px]`} />
          </div>
          <div className="mb-4">
            <label className={labelClass}>อัตราภาษี VAT (%)</label>
            <input type="number" min={0} max={100} step={0.01} value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value) || 0)} className={`${inputClass} w-[130px]`} />
          </div>
          <div className={`flex items-center justify-between ${isMobile ? 'py-4' : 'py-2.5'} border-b border-[#e4e0d8]`}>
            <div className={`${isMobile ? 'text-sm' : 'text-[13px]'} font-semibold`}>ราคารวม VAT แล้ว</div>
            <button
              type="button"
              onClick={() => setPricesIncludeTax(!pricesIncludeTax)}
              className={`${toggleBtnClass} ${pricesIncludeTax ? 'bg-[#16a34a]' : 'bg-[#e4e0d8]'}`}
              aria-label={pricesIncludeTax ? 'ปิด' : 'เปิด'}
            >
              <span className={`${toggleKnobClass} ${pricesIncludeTax ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <button type="button" onClick={handleSaveTax} disabled={taxSaving} className={`${btnClass} mt-4`}>
            {taxSaving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
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

    </>
  );
}
