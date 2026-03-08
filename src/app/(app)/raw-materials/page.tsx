'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Minus, Pencil } from 'lucide-react';
import {
  fetchRawMaterials,
  fetchRawMaterialsWithStatus,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  getRawMaterialUsageCount,
  adjustRawMaterialStock,
  RAW_MATERIAL_UNITS,
} from '@/lib/raw-materials';
import type { RawMaterial, RawMaterialUnit } from '@/types/pos';
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

const UNIT_LABELS: Record<RawMaterialUnit, string> = {
  g: 'กรัม (g)',
  kg: 'กิโลกรัม (kg)',
  pcs: 'ชิ้น (pcs)',
  ml: 'มิลลิลิตร (ml)',
};

export default function RawMaterialsPage() {
  const [search, setSearch] = useState('');
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<RawMaterial | null>(null);
  const [deleting, setDeleting] = useState<RawMaterial | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [usageCounts, setUsageCounts] = useState<Record<number, number>>({});
  const [adjustingId, setAdjustingId] = useState<number | null>(null);
  const [schemaReady, setSchemaReady] = useState<boolean | null>(null);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    setSchemaError(null);
    const result = await fetchRawMaterialsWithStatus();
    setSchemaReady(result.schemaReady);
    if (!result.schemaReady) {
      setSchemaError(result.error ?? null);
      setMaterials([]);
      setUsageCounts({});
      setLoading(false);
      return;
    }
    setMaterials(result.materials);
    const counts: Record<number, number> = {};
    await Promise.all(result.materials.map(async (m) => { counts[m.id] = await getRawMaterialUsageCount(m.id); }));
    setUsageCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const filtered = search.trim()
    ? materials.filter((m) => m.name.toLowerCase().includes(search.trim().toLowerCase()))
    : materials;

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement)?.value?.trim();
    const unit = (form.elements.namedItem('unit') as HTMLSelectElement)?.value as RawMaterialUnit;
    const amountRaw = (form.elements.namedItem('amount_units') as HTMLInputElement)?.value;
    const gramsRaw = (form.elements.namedItem('grams') as HTMLInputElement)?.value;
    const thresholdRaw = (form.elements.namedItem('low_stock_threshold') as HTMLInputElement)?.value;
    if (!name) {
      setAddError('กรุณากรอกชื่อวัตถุดิบ');
      return;
    }
    const amountUnits = amountRaw !== '' ? Math.max(1, Number(amountRaw) || 1) : 1;
    const grams = gramsRaw !== '' ? Number(gramsRaw) : 0;
    const stock_qty = amountUnits * grams;
    const low_stock_threshold = thresholdRaw !== '' ? Number(thresholdRaw) : null;
    if (stock_qty < 0) {
      setAddError('สต็อกต้องไม่เป็นค่าติดลบ');
      return;
    }
    setAddError(null);
    setAddSubmitting(true);
    const { rawMaterial, error } = await createRawMaterial({
      name,
      unit: unit ?? 'g',
      stock_qty,
      low_stock_threshold: low_stock_threshold ?? undefined,
    });
    setAddSubmitting(false);
    if (rawMaterial) {
      setAddOpen(false);
      loadMaterials();
    } else {
      setAddError(error ?? 'ไม่สามารถเพิ่มได้');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const form = e.currentTarget;
    const name = (form.elements.namedItem('edit-name') as HTMLInputElement)?.value?.trim();
    const unit = (form.elements.namedItem('edit-unit') as HTMLSelectElement)?.value as RawMaterialUnit;
    const amountRaw = (form.elements.namedItem('edit-amount_units') as HTMLInputElement)?.value;
    const gramsRaw = (form.elements.namedItem('edit-grams') as HTMLInputElement)?.value;
    const thresholdRaw = (form.elements.namedItem('edit-low_stock_threshold') as HTMLInputElement)?.value;
    if (!name) {
      setEditError('กรุณากรอกชื่อวัตถุดิบ');
      return;
    }
    const amountUnits = amountRaw !== '' ? Math.max(1, Number(amountRaw) || 1) : 1;
    const grams = gramsRaw !== '' ? Number(gramsRaw) : 0;
    const stock_qty = amountUnits * grams;
    const low_stock_threshold = thresholdRaw !== '' ? Number(thresholdRaw) : null;
    if (stock_qty < 0) {
      setEditError('สต็อกต้องไม่เป็นค่าติดลบ');
      return;
    }
    setEditError(null);
    setEditSubmitting(true);
    const { rawMaterial, error } = await updateRawMaterial(editing.id, {
      name,
      unit: unit ?? 'g',
      stock_qty,
      low_stock_threshold,
    });
    setEditSubmitting(false);
    if (rawMaterial) {
      setEditing(null);
      loadMaterials();
    } else {
      setEditError(error ?? 'ไม่สามารถบันทึกได้');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    setDeleteError(null);
    setDeleteSubmitting(true);
    const { success, error } = await deleteRawMaterial(deleting.id);
    setDeleteSubmitting(false);
    if (success) {
      setDeleting(null);
      loadMaterials();
    } else {
      setDeleteError(error ?? 'ไม่สามารถลบได้');
    }
  };

  const handleStockAdjust = async (m: RawMaterial, delta: number) => {
    setAdjustingId(m.id);
    const { rawMaterial } = await adjustRawMaterialStock(
      m.id,
      delta,
      delta > 0 ? 'restock' : 'adjustment'
    );
    setAdjustingId(null);
    if (rawMaterial) {
      setMaterials((prev) => prev.map((x) => (x.id === m.id ? rawMaterial : x)));
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="shrink-0 border-b border-[#e4e0d8] bg-white px-4 md:px-5 py-3 md:py-3.5">
        <h2 className="font-heading text-xl font-black leading-none mb-0.5 text-[#1a1816]">
          วัตถุดิบ
        </h2>
        <p className="text-xs text-[#9a9288]">จัดการวัตถุดิบและสต็อก สำหรับหักเมื่อขายตามสูตรในเมนู</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9288]" />
            <input
              type="search"
              placeholder="ค้นหาวัตถุดิบ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#e4e0d8] bg-[#f7f5f0] text-sm text-[#1a1816] focus:outline-none focus:border-[#FA3E3E]"
            />
          </div>
          <Button
            type="button"
            onClick={() => { setAddOpen(true); setAddError(null); }}
            className="bg-[#FA3E3E] hover:bg-[#e03838] text-white font-bold shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            เพิ่มวัตถุดิบ
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-[#9a9288] py-8">กำลังโหลด...</p>
        ) : schemaReady === false ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <h3 className="font-bold mb-2">ตารางวัตถุดิบยังไม่ได้สร้าง</h3>
            {schemaError && <p className="mb-3">{schemaError}</p>}
            <p className="mb-3">ทำตามขั้นตอนด้านล่างใน Supabase Dashboard:</p>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>เปิด <strong>SQL Editor</strong></li>
              <li>เปิดไฟล์ <code className="bg-amber-100 px-1 rounded">supabase/migrations/017_raw_materials.sql</code> ในโปรเจกต์ แล้วคัดลอกเนื้อหาทั้งหมดไปวางใน SQL Editor</li>
              <li>กด <strong>Run</strong></li>
              <li>จากนั้นรันคำสั่งนี้เพื่อรีเฟรช schema cache: <code className="block mt-1 bg-amber-100 p-2 rounded text-xs">NOTIFY pgrst, &apos;reload schema&apos;;</code></li>
            </ol>
            <Button type="button" onClick={() => loadMaterials()} className="bg-amber-600 hover:bg-amber-700 text-white">
              ลองโหลดอีกครั้ง
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-[#9a9288] py-8">
            {search.trim() ? 'ไม่พบวัตถุดิบที่ตรงกับคำค้น' : 'ยังไม่มีวัตถุดิบ — กดปุ่มเพิ่มวัตถุดิบ'}
          </p>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto rounded-lg border border-[#e4e0d8] bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                      ชื่อ
                    </th>
                    <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                      หน่วย
                    </th>
                    <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                      สต็อก
                    </th>
                    <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                      แจ้งเตือนเมื่อต่ำกว่า
                    </th>
                    <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                      ใช้ในเมนู
                    </th>
                    <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                      {' '}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-[#f7f5f0]">
                      <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white font-bold text-[#1a1816]">
                        {m.name}
                      </td>
                      <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white text-[#6b6358]">
                        {UNIT_LABELS[m.unit]}
                      </td>
                      <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white">
                        <div className="flex items-center gap-1">
                          <span className="font-heading tabular-nums text-[#1a1816]">
                            {m.stock_qty}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleStockAdjust(m, -1)}
                              disabled={adjustingId === m.id || m.stock_qty <= 0}
                              className="w-6 h-6 rounded border border-[#e4e0d8] flex items-center justify-center text-[#9a9288] hover:border-[#FA3E3E] hover:text-[#FA3E3E] disabled:opacity-50"
                              aria-label="ลดสต็อก"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStockAdjust(m, 1)}
                              disabled={adjustingId === m.id}
                              className="w-6 h-6 rounded border border-[#e4e0d8] flex items-center justify-center text-[#9a9288] hover:border-[#FA3E3E] hover:text-[#FA3E3E] disabled:opacity-50"
                              aria-label="เพิ่มสต็อก"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white text-[#6b6358]">
                        {m.low_stock_threshold != null ? m.low_stock_threshold : '—'}
                      </td>
                      <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white text-[#6b6358] text-sm">
                        {usageCounts[m.id] ?? 0} จาน
                      </td>
                      <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => { setEditing(m); setEditError(null); }}
                            className="py-1.5 px-3 rounded-md border border-[#e4e0d8] bg-transparent text-[#9a9288] text-[11px] font-bold cursor-pointer hover:border-[#FA3E3E] hover:text-[#FA3E3E] transition-colors"
                          >
                            แก้ไข
                          </button>
                          <button
                            type="button"
                            onClick={() => { setDeleting(m); setDeleteError(null); }}
                            className="p-1.5 rounded-md border border-transparent text-[#9a9288] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
                            aria-label="ลบ"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3 pb-4">
              {filtered.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-xl p-4 border border-[#e4e0d8] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-sm text-[#1a1816]">{m.name}</h3>
                    <span className="text-[11px] text-[#6b6358]">{UNIT_LABELS[m.unit]}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#9a9288]">
                        สต็อก: <strong className="text-[#1a1816]">{m.stock_qty}</strong>
                        {m.low_stock_threshold != null && (
                          <span className="ml-1">(แจ้งเตือน &lt; {m.low_stock_threshold})</span>
                        )}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleStockAdjust(m, -1)}
                          disabled={adjustingId === m.id || m.stock_qty <= 0}
                          className="w-7 h-7 rounded-lg border border-[#e4e0d8] flex items-center justify-center text-[#9a9288]"
                          aria-label="ลดสต็อก"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStockAdjust(m, 1)}
                          disabled={adjustingId === m.id}
                          className="w-7 h-7 rounded-lg border border-[#e4e0d8] flex items-center justify-center text-[#9a9288]"
                          aria-label="เพิ่มสต็อก"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#6b6358]">ใช้ใน {usageCounts[m.id] ?? 0} จาน</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#e4e0d8]">
                    <button
                      type="button"
                      onClick={() => { setEditing(m); setEditError(null); }}
                      className="flex items-center gap-1.5 py-2 px-3 rounded-lg border border-[#e4e0d8] bg-transparent text-[#9a9288] text-xs font-bold"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      แก้ไข
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeleting(m); setDeleteError(null); }}
                      className="flex items-center gap-1.5 py-2 px-3 rounded-lg border border-transparent text-[#9a9288] text-xs font-bold hover:text-[#dc2626]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setAddError(null); }}>
        <DialogContent className="sm:max-w-[400px] border-[#e4e0d8]">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#1a1816]">เพิ่มวัตถุดิบ</DialogTitle>
          </DialogHeader>
          <form key={addOpen ? 'add-open' : 'add-closed'} onSubmit={handleAddSubmit} className="space-y-4">
            {addError && (
              <div className="rounded-lg bg-[#fef2f2] border border-[#fecaca] px-3 py-2 text-sm text-[#dc2626]">
                {addError}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#9a9288]">ชื่อวัตถุดิบ</Label>
              <Input
                name="name"
                required
                placeholder="เช่น ไก่, ข้าว"
                className="border-[#e4e0d8] focus:border-[#FA3E3E]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#9a9288]">หน่วย</Label>
              <select
                name="unit"
                className="w-full min-h-11 rounded-md border border-[#e4e0d8] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#FA3E3E]"
              >
                {RAW_MATERIAL_UNITS.map((u) => (
                  <option key={u} value={u}>{UNIT_LABELS[u]}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#9a9288]">จำนวนหน่วย (Amount)</Label>
                <Input
                  name="amount_units"
                  type="number"
                  min={1}
                  step={1}
                  defaultValue={1}
                  placeholder="1"
                  className="border-[#e4e0d8] focus:border-[#FA3E3E]"
                />
                <p className="text-[10px] text-[#9a9288]">เช่น 2 ถุง, 3 กล่อง</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#9a9288]">กรัม (Grams)</Label>
                <Input
                  name="grams"
                  type="number"
                  min={0}
                  step="any"
                  defaultValue={0}
                  placeholder="0"
                  className="border-[#e4e0d8] focus:border-[#FA3E3E]"
                />
                <p className="text-[10px] text-[#9a9288]">กรัมต่อหน่วย หรือกรัมรวม</p>
              </div>
            </div>
            <p className="text-[11px] text-[#6b6358]">สต็อกรวม = จำนวนหน่วย × กรัม (บันทึกเป็นหน่วยด้านบน เช่น g/kg)</p>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#9a9288]">แจ้งเตือนเมื่อสต็อกต่ำกว่า (ไม่บังคับ)</Label>
              <Input
                name="low_stock_threshold"
                type="number"
                min={0}
                step="any"
                placeholder="เว้นว่างได้"
                className="border-[#e4e0d8] focus:border-[#FA3E3E]"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                className="border-[#e4e0d8]"
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={addSubmitting} className="bg-[#FA3E3E] hover:bg-[#e03838]">
                {addSubmitting ? 'กำลังบันทึก...' : 'เพิ่ม'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); setEditError(null); }}>
        <DialogContent className="sm:max-w-[400px] border-[#e4e0d8]">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#1a1816]">แก้ไขวัตถุดิบ</DialogTitle>
          </DialogHeader>
          {editing && (
            <form key={editing.id} onSubmit={handleEditSubmit} className="space-y-4">
              {editError && (
                <div className="rounded-lg bg-[#fef2f2] border border-[#fecaca] px-3 py-2 text-sm text-[#dc2626]">
                  {editError}
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#9a9288]">ชื่อวัตถุดิบ</Label>
                <Input
                  name="edit-name"
                  required
                  defaultValue={editing.name}
                  className="border-[#e4e0d8] focus:border-[#FA3E3E]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#9a9288]">หน่วย</Label>
                <select
                  name="edit-unit"
                  defaultValue={editing.unit}
                  className="w-full min-h-11 rounded-md border border-[#e4e0d8] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#FA3E3E]"
                >
                  {RAW_MATERIAL_UNITS.map((u) => (
                    <option key={u} value={u}>{UNIT_LABELS[u]}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#9a9288]">จำนวนหน่วย (Amount)</Label>
                  <Input
                    name="edit-amount_units"
                    type="number"
                    min={1}
                    step={1}
                    defaultValue={1}
                    placeholder="1"
                    className="border-[#e4e0d8] focus:border-[#FA3E3E]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#9a9288]">กรัม (Grams)</Label>
                  <Input
                    name="edit-grams"
                    type="number"
                    min={0}
                    step="any"
                    defaultValue={editing.stock_qty}
                    placeholder="0"
                    className="border-[#e4e0d8] focus:border-[#FA3E3E]"
                  />
                </div>
              </div>
              <p className="text-[11px] text-[#6b6358]">สต็อกรวม = จำนวนหน่วย × กรัม</p>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#9a9288]">แจ้งเตือนเมื่อสต็อกต่ำกว่า (ไม่บังคับ)</Label>
                <Input
                  name="edit-low_stock_threshold"
                  type="number"
                  min={0}
                  step="any"
                  defaultValue={editing.low_stock_threshold ?? ''}
                  placeholder="เว้นว่างได้"
                  className="border-[#e4e0d8] focus:border-[#FA3E3E]"
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(null)}
                  className="border-[#e4e0d8]"
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={editSubmitting} className="bg-[#FA3E3E] hover:bg-[#e03838]">
                  {editSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleting} onOpenChange={(o) => { if (!o) setDeleting(null); setDeleteError(null); }}>
        <DialogContent className="sm:max-w-[400px] border-[#e4e0d8]">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#1a1816]">ลบวัตถุดิบ</DialogTitle>
          </DialogHeader>
          {deleting && (
            <>
              <p className="text-sm text-[#6b6358]">
                คุณต้องการลบ &quot;{deleting.name}&quot; ใช่หรือไม่?
                {(usageCounts[deleting.id] ?? 0) > 0 && (
                  <span className="block mt-2 text-[#dc2626] font-medium">
                    วัตถุดิบนี้ใช้ใน {usageCounts[deleting.id]} จาน — กรุณาเอาออกจากสูตรในหน้าเมนูก่อน
                  </span>
                )}
              </p>
              {deleteError && (
                <div className="rounded-lg bg-[#fef2f2] border border-[#fecaca] px-3 py-2 text-sm text-[#dc2626]">
                  {deleteError}
                </div>
              )}
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleting(null)}
                  className="border-[#e4e0d8]"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleteSubmitting}
                  className="bg-[#dc2626] hover:bg-[#b91c1c]"
                >
                  {deleteSubmitting ? 'กำลังลบ...' : 'ลบ'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
