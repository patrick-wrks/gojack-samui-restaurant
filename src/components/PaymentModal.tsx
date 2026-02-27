'use client';

import { useState, useEffect } from 'react';
import type { PaymentMethod } from '@/types/pos';

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

  useEffect(() => {
    if (open) {
      setStep('form');
      setModalMethod(payType);
      setTendered('');
    }
  }, [open, payType]);

  const totalFormatted = `฿${total.toLocaleString()}`;
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
    <div className="fixed inset-0 bg-black/45 z-[300] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white border border-[#e4e0d8] rounded-[20px] w-full max-w-[390px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-[rise_.22s_ease]">
        {step === 'form' ? (
          <>
            <div className="p-4 border-b border-[#e4e0d8] flex items-center justify-between">
              <h3 className="font-heading text-base font-extrabold">ชำระเงิน</h3>
              <button
                type="button"
                onClick={onClose}
                className="bg-[#f7f5f0] border-none rounded-[7px] w-7 h-7 cursor-pointer text-base flex items-center justify-center text-[#9a9288] hover:bg-[#e4e0d8]"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <div className="text-center mb-5 pb-4 border-b border-[#e4e0d8]">
                <div className="text-[11px] text-[#9a9288] uppercase tracking-wider mb-1">
                  ยอดที่ต้องชำระ
                </div>
                <div className="font-heading text-[44px] font-black text-[#1a1816] leading-none">
                  {totalFormatted}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setModalMethod('cash')}
                  className={`py-3 px-2 rounded-xl border-[1.5px] text-center transition-all font-sans cursor-pointer ${
                    modalMethod === 'cash'
                      ? 'border-[#d4800a] bg-[rgba(212,128,10,0.1)]'
                      : 'border-[#e4e0d8] bg-[#f7f5f0] hover:border-[#d4800a]'
                  }`}
                >
                  <div className="text-[26px] mb-1">💵</div>
                  <div className="text-[13px] font-bold text-[#1a1816]">เงินสด</div>
                </button>
                <button
                  type="button"
                  onClick={() => setModalMethod('bank')}
                  className={`py-3 px-2 rounded-xl border-[1.5px] text-center transition-all font-sans cursor-pointer ${
                    modalMethod === 'bank'
                      ? 'border-[#d4800a] bg-[rgba(212,128,10,0.1)]'
                      : 'border-[#e4e0d8] bg-[#f7f5f0] hover:border-[#d4800a]'
                  }`}
                >
                  <div className="text-[26px] mb-1">🏦</div>
                  <div className="text-[13px] font-bold text-[#1a1816]">โอนเงิน</div>
                </button>
              </div>
              {modalMethod === 'cash' && (
                <>
                  <div className="mb-3.5">
                    <label className="block text-[10px] font-bold text-[#9a9288] uppercase tracking-wider mb-1.5">
                      รับมา (฿)
                    </label>
                    <input
                      type="number"
                      value={tendered}
                      onChange={(e) => setTendered(e.target.value)}
                      placeholder="0"
                      className="w-full bg-[#f7f5f0] border-[1.5px] border-[#e4e0d8] rounded-[9px] py-2.5 px-3 font-heading text-2xl font-extrabold text-[#1a1816] focus:outline-none focus:border-[#16a34a]"
                    />
                  </div>
                  {change > 0 && (
                    <div className="bg-[rgba(22,163,74,0.1)] border border-[rgba(34,197,94,0.25)] rounded-[9px] py-2.5 px-3 flex justify-between items-center mb-3.5">
                      <span className="text-[13px] text-[#16a34a] font-bold">เงินทอน</span>
                      <strong className="text-xl font-black text-[#16a34a] font-heading">
                        ฿{change.toLocaleString()}
                      </strong>
                    </div>
                  )}
                </>
              )}
              {modalMethod === 'bank' && (
                <div className="bg-[#f7f5f0] border-[1.5px] border-dashed border-[#d4cfc5] rounded-[11px] p-4 text-center mb-4">
                  <p className="text-[13px] text-[#9a9288] mb-1.5">ให้ลูกค้าโอนมาที่</p>
                  <strong className="text-base font-extrabold text-[#1a1816]">
                    กสิกรไทย · 123-4-56789-0
                  </strong>
                </div>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full bg-[#16a34a] border-none rounded-[11px] py-3.5 text-white font-heading font-black text-[15px] cursor-pointer hover:opacity-90 transition-opacity"
              >
                ✓ ยืนยันและบันทึกออเดอร์
              </button>
            </div>
          </>
        ) : (
          <div className="p-7 text-center">
            <div className="w-[68px] h-[68px] bg-[rgba(22,163,74,0.1)] rounded-full flex items-center justify-center text-[34px] mx-auto mb-3.5">
              ✅
            </div>
            <h3 className="font-heading text-[22px] font-black mb-1">บันทึกออเดอร์สำเร็จ!</h3>
            <p className="text-[13px] text-[#9a9288] mb-5">
              ออเดอร์ #{orderNum} · {modalMethod === 'cash' ? 'เงินสด' : 'โอนเงิน'} · {totalFormatted}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-3 rounded-[10px] border border-[#e4e0d8] bg-transparent font-sans text-[13px] font-bold cursor-pointer text-[#1a1816] hover:opacity-85 transition-opacity"
              >
                🖨 พิมพ์ใบเสร็จ
              </button>
              <button
                type="button"
                onClick={handleNewOrder}
                className="py-3 rounded-[10px] bg-[#d4800a] border border-[#d4800a] text-black font-sans text-[13px] font-bold cursor-pointer hover:opacity-85 transition-opacity"
              >
                ออเดอร์ใหม่ →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
