'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { DiscountInput, DiscountType } from '@/types/pos';

interface DiscountModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (discount: DiscountInput) => void;
  currency: string;
  subtotal: number;
  currentDiscount?: DiscountInput;
}

export function DiscountModal({
  open,
  onClose,
  onApply,
  currency,
  subtotal,
  currentDiscount,
}: DiscountModalProps) {
  const [type, setType] = useState<DiscountType>(currentDiscount?.type ?? 'amount');
  const [value, setValue] = useState(
    currentDiscount && currentDiscount.value > 0
      ? String(currentDiscount.value)
      : ''
  );

  useEffect(() => {
    if (open) {
      setType(currentDiscount?.type ?? 'amount');
      setValue(
        currentDiscount && currentDiscount.value > 0
          ? String(currentDiscount.value)
          : ''
      );
    }
  }, [open, currentDiscount]);

  const numValue = Number(value);
  const isValid =
    value !== '' &&
    !Number.isNaN(numValue) &&
    numValue >= 0 &&
    (type === 'percent' ? numValue <= 100 : true);

  const previewAmount =
    isValid && subtotal > 0
      ? type === 'percent'
        ? Math.min((subtotal * numValue) / 100, subtotal)
        : Math.min(numValue, subtotal)
      : 0;

  const handleApply = () => {
    if (!isValid || numValue <= 0) return;
    onApply({ type, value: numValue });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ส่วนลด</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>ประเภทส่วนลด</Label>
            <div
              role="tablist"
              aria-label="ประเภทส่วนลด"
              className="flex p-1 rounded-xl bg-[#f2f0eb] border border-[#e4e0d8]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={type === 'percent'}
                aria-label="เปอร์เซ็นต์"
                onClick={() => setType('percent')}
                className={cn(
                  'flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200',
                  type === 'percent'
                    ? 'bg-white text-[#1a1816] shadow-sm border border-[#e4e0d8]'
                    : 'text-[#6b6358] hover:text-[#1a1816] active:bg-white/50'
                )}
              >
                เปอร์เซ็นต์ (%)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={type === 'amount'}
                aria-label="จำนวนเงิน"
                onClick={() => setType('amount')}
                className={cn(
                  'flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200',
                  type === 'amount'
                    ? 'bg-white text-[#1a1816] shadow-sm border border-[#e4e0d8]'
                    : 'text-[#6b6358] hover:text-[#1a1816] active:bg-white/50'
                )}
              >
                จำนวนเงิน ({currency})
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-value">
              {type === 'percent' ? 'เปอร์เซ็นต์ (%)' : `จำนวนเงิน (${currency})`}
            </Label>
            <Input
              id="discount-value"
              type="number"
              min={0}
              max={type === 'percent' ? 100 : undefined}
              step={type === 'percent' ? 1 : 0.01}
              placeholder={type === 'percent' ? '0–100' : '0'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="text-lg tabular-nums"
            />
          </div>
          {isValid && numValue > 0 && subtotal > 0 && (
            <div className="rounded-lg bg-[#f8f6f2] border border-[#e4e0d8] p-3 text-sm text-[#6b6358]">
              <span className="font-medium">ส่วนลด:</span>{' '}
              –{currency}{previewAmount.toLocaleString()} ·{' '}
              <span className="font-medium">
                รวมทั้งสิ้น {currency}
                {(subtotal - previewAmount).toLocaleString()}
              </span>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleApply}
            disabled={!isValid || numValue <= 0}
            className="bg-green-600 hover:bg-green-700"
          >
            ใช้ส่วนลด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
