'use client';

import { useState, useEffect } from 'react';
import { X, Printer, ArrowRight, Check } from 'lucide-react';
import type { PaymentMethod } from '@/types/pos';
import { useCurrencySymbol, useStoreSettingsStore } from '@/store/store-settings-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  payType: PaymentMethod;
  orderNum: number;
  onConfirm: () => void;
}

export function PaymentModal({
  open,
  onClose,
  total,
  payType,
  orderNum,
  onConfirm,
}: PaymentModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [modalMethod, setModalMethod] = useState<PaymentMethod>(payType);
  const [tendered, setTendered] = useState('');
  const currency = useCurrencySymbol();
  const store = useStoreSettingsStore((s) => s.store);

  const bankName = store?.bank_name || '';
  const bankAccount = store?.bank_account_number || '';
  const bankAccountName = store?.bank_account_name || '';
  const hasBankInfo = bankName && bankAccount;

  useEffect(() => {
    if (open) {
      setStep('form');
      setModalMethod(payType);
      setTendered('');
    }
  }, [open, payType]);

  const totalFormatted = `${currency}${total.toLocaleString()}`;
  const tenderedNum = parseFloat(tendered) || 0;
  const change = tenderedNum >= total ? tenderedNum - total : 0;

  const handleConfirm = () => {
    onConfirm();
    setStep('success');
  };

  const handleNewOrder = () => {
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[300] flex items-end md:items-center justify-center backdrop-blur-sm animate-[fadeIn_.15s_ease]">
      <div className="bg-white border border-[#e4e0d8] rounded-t-[24px] md:rounded-[20px] w-full md:w-auto md:max-w-[390px] md:mx-4 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-[slideUp_.25s_cubic-bezier(.22,1,.36,1)] md:animate-[rise_.22s_ease] max-h-[90vh] md:max-h-none overflow-y-auto min-w-0 max-w-[calc(100vw-2rem)]">
        {step === 'form' ? (
          <>
            {/* Handle for mobile */}
            <div className="md:hidden flex items-center justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-[#e4e0d8] rounded-full" />
            </div>

            <div className="p-4 md:p-4 border-b border-[#e4e0d8] flex items-center justify-between">
              <h3 className="font-heading text-lg md:text-base font-extrabold">ชำระเงิน</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="bg-[#f7f5f0] hover:bg-[#e4e0d8] rounded-full w-9 h-9 md:w-7 md:h-7 text-[#9a9288] touch-target"
              >
                <X className="w-5 h-5 md:w-4 md:h-4" />
              </Button>
            </div>

            <div className="p-5 md:p-5">
              <div className="text-center mb-6 md:mb-5 pb-5 md:pb-4 border-b border-[#e4e0d8] min-w-0 overflow-hidden">
                <div className="text-xs md:text-[11px] text-[#9a9288] uppercase tracking-wider mb-2 md:mb-1">
                  ยอดที่ต้องชำระ
                </div>
                <div className="font-heading text-[52px] md:text-[44px] font-black text-[#1a1816] leading-none overflow-hidden text-ellipsis break-all">
                  {totalFormatted}
                </div>
              </div>

              {/* Payment Method Selection */}
              <ToggleGroup
                type="single"
                value={modalMethod}
                onValueChange={(v) => v && setModalMethod(v as PaymentMethod)}
                className="grid grid-cols-2 gap-3 md:gap-2 mb-5 md:mb-4 w-full"
                spacing={0}
              >
                <ToggleGroupItem
                  value="cash"
                  className={cn(
                    "flex flex-col items-center py-5 md:py-3 px-3 rounded-2xl md:rounded-xl border-2 text-center transition-all font-sans cursor-pointer touch-target h-auto",
                    "data-[state=off]:border-[#e4e0d8] data-[state=off]:bg-[#f7f5f0] data-[state=off]:active:border-[#d4800a]",
                    "data-[state=on]:border-[#d4800a] data-[state=on]:bg-[rgba(212,128,10,0.1)] data-[state=on]:shadow-sm"
                  )}
                >
                  <div className="text-[32px] md:text-[26px] mb-2 md:mb-1">💵</div>
                  <div className="text-base md:text-[13px] font-bold text-[#1a1816]">เงินสด</div>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="bank"
                  className={cn(
                    "flex flex-col items-center py-5 md:py-3 px-3 rounded-2xl md:rounded-xl border-2 text-center transition-all font-sans cursor-pointer touch-target h-auto",
                    "data-[state=off]:border-[#e4e0d8] data-[state=off]:bg-[#f7f5f0] data-[state=off]:active:border-[#d4800a]",
                    "data-[state=on]:border-[#d4800a] data-[state=on]:bg-[rgba(212,128,10,0.1)] data-[state=on]:shadow-sm"
                  )}
                >
                  <div className="text-[32px] md:text-[26px] mb-2 md:mb-1">🏦</div>
                  <div className="text-base md:text-[13px] font-bold text-[#1a1816]">โอนเงิน</div>
                </ToggleGroupItem>
              </ToggleGroup>

              {modalMethod === 'cash' && (
                <>
                  <div className="mb-4 md:mb-3.5 space-y-2 md:space-y-1.5">
                    <label className="block text-xs md:text-[10px] font-bold text-[#9a9288] uppercase tracking-wider">
                      รับมา ({currency})
                    </label>
                    <Input
                      type="number"
                      value={tendered}
                      onChange={(e) => setTendered(e.target.value)}
                      placeholder="0"
                      inputMode="numeric"
                      className={cn(
                        "w-full bg-[#f7f5f0] border-2 border-[#e4e0d8] rounded-xl md:rounded-[9px]",
                        "py-4 md:py-2.5 px-4 md:px-3 font-heading text-3xl md:text-2xl font-extrabold text-[#1a1816]",
                        "touch-target text-center focus:border-[#16a34a]"
                      )}
                    />
                  </div>
                  {change > 0 && (
                    <div className="bg-[rgba(22,163,74,0.1)] border border-[rgba(34,197,94,0.25)] rounded-xl md:rounded-[9px] py-4 md:py-2.5 px-4 md:px-3 flex justify-between items-center gap-2 mb-4 md:mb-3.5 min-w-0">
                      <span className="text-base md:text-[13px] text-[#16a34a] font-bold shrink-0">เงินทอน</span>
                      <strong className="text-2xl md:text-xl font-black text-[#16a34a] font-heading text-truncate-safe min-w-0 text-right">
                        {currency}{change.toLocaleString()}
                      </strong>
                    </div>
                  )}
                </>
              )}

              {modalMethod === 'bank' && (
                <div className="bg-[#f7f5f0] border-2 border-dashed border-[#d4cfc5] rounded-xl md:rounded-[11px] p-5 md:p-4 text-center mb-5 md:mb-4">
                  <p className="text-sm md:text-[13px] text-[#9a9288] mb-2 md:mb-1.5">ให้ลูกค้าโอนมาที่</p>
                  {hasBankInfo ? (
                    <div className="space-y-1">
                      <strong className="text-lg md:text-base font-extrabold text-[#1a1816] block">
                        {bankName} · {bankAccount}
                      </strong>
                      {bankAccountName && (
                        <span className="text-sm md:text-[12px] text-[#6b6358] block">{bankAccountName}</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm md:text-[13px] text-[#dc2626]">
                      ยังไม่ได้ตั้งค่าบัญชีธนาคาร<br/>กรุณาตั้งค่าในเมนู ตั้งค่าระบบ
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={handleConfirm}
                className="w-full min-w-0 bg-[#16a34a] hover:bg-[#16a34a]/90 border-none rounded-xl md:rounded-[11px] py-5 md:py-3.5 h-auto text-white font-heading font-black text-lg md:text-[15px] active:opacity-90 touch-target shadow-[0_4px_15px_rgba(22,163,74,0.3)] flex items-center justify-center gap-2 text-truncate-safe overflow-hidden"
              >
                <Check className="w-5 h-5 shrink-0" />
                ยืนยันและบันทึกออเดอร์
              </Button>
            </div>
          </>
        ) : (
          <div className="p-8 md:p-7 text-center">
            <div className="w-[90px] h-[90px] md:w-[68px] md:h-[68px] bg-[rgba(22,163,74,0.1)] rounded-full flex items-center justify-center text-[42px] md:text-[34px] mx-auto mb-5 md:mb-3.5">
              ✅
            </div>
            <h3 className="font-heading text-[26px] md:text-[22px] font-black mb-2 md:mb-1">บันทึกออเดอร์สำเร็จ!</h3>
            <p className="text-base md:text-[13px] text-[#9a9288] mb-6 md:mb-5 break-words overflow-hidden min-w-0">
              ออเดอร์ #{orderNum} · {modalMethod === 'cash' ? 'เงินสด' : 'โอนเงิน'} · {totalFormatted}
            </p>
            <div className="grid grid-cols-2 gap-3 md:gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="py-4 md:py-3 h-auto rounded-xl md:rounded-[10px] border-[#e4e0d8] bg-transparent font-sans text-sm md:text-[13px] font-bold text-[#1a1816] active:bg-[#f7f5f0] touch-target flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                พิมพ์ใบเสร็จ
              </Button>
              <Button
                onClick={handleNewOrder}
                className="py-4 md:py-3 h-auto rounded-xl md:rounded-[10px] bg-[#d4800a] hover:bg-[#d4800a]/90 border border-[#d4800a] text-black font-sans text-sm md:text-[13px] font-bold active:opacity-85 touch-target flex items-center justify-center gap-2"
              >
                ออเดอร์ใหม่
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
