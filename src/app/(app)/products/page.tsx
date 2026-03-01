'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Tag, ChevronRight, Trash2 } from 'lucide-react';
import { getCategoriesForUI } from '@/store/menu-store';
import { useCurrencySymbol } from '@/store/store-settings-store';
import { fetchProducts, createProduct, updateProduct, deleteProduct, createCategory } from '@/lib/menu';
import { useMenuStore } from '@/store/menu-store';
import type { Product } from '@/types/pos';
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

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [categoryAddOpen, setCategoryAddOpen] = useState(false);
  const [categoryAddName, setCategoryAddName] = useState('');
  const [categoryAddColor, setCategoryAddColor] = useState('#6b7280');
  const [categoryAddError, setCategoryAddError] = useState<string | null>(null);
  const [categoryAddSubmitting, setCategoryAddSubmitting] = useState(false);
  const currency = useCurrencySymbol();

  const categories = getCategoriesForUI().filter((c) => c.id !== 'all');

  const CATEGORY_COLORS = [
    { value: '#ef4444', label: 'แดง' },
    { value: '#f97316', label: 'ส้ม' },
    { value: '#eab308', label: 'เหลือง' },
    { value: '#22c55e', label: 'เขียว' },
    { value: '#06b6d4', label: 'ฟ้า' },
    { value: '#8b5cf6', label: 'ม่วง' },
    { value: '#3b82f6', label: 'น้ำเงิน' },
    { value: '#ec4899', label: 'ชมพู' },
    { value: '#6b7280', label: 'เทา' },
  ];

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    const list = await fetchProducts(false);
    setProducts(list);
    setProductsLoading(false);
  }, []);

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = categoryAddName.trim();
    if (!name) {
      setCategoryAddError('กรุณากรอกชื่อหมวดหมู่');
      return;
    }
    setCategoryAddError(null);
    setCategoryAddSubmitting(true);
    const { category, error } = await createCategory({
      name,
      color: categoryAddColor,
      sort_order: categories.length,
    });
    setCategoryAddSubmitting(false);
    if (category) {
      setCategoryAddOpen(false);
      setCategoryAddName('');
      setCategoryAddColor('#6b7280');
      useMenuStore.getState().loadMenu();
    } else {
      setCategoryAddError(error ?? 'ไม่สามารถเพิ่มหมวดหมู่ได้');
    }
  };

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleToggleActive = useCallback(
    async (p: Product) => {
      const next = !(p.is_active !== false);
      setTogglingId(p.id);
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, is_active: next } : item))
      );
      const { product: updated, error } = await updateProduct(p.id, { is_active: next });
      setTogglingId(null);
      if (updated) {
        useMenuStore.getState().loadMenu();
      } else {
        setProducts((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, is_active: !next } : item))
        );
        if (error) setEditError(error);
      }
    },
    []
  );

  const filteredMenu = search
    ? products.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const categoriesWithCount = categories.map((c) => ({
    ...c,
    count: products.filter((m) => m.cat === c.id).length,
  }));

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddError(null);
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const category_id = (form.elements.namedItem('category_id') as HTMLSelectElement).value;
    const price = Number((form.elements.namedItem('price') as HTMLInputElement).value);
    if (!name || !category_id || Number.isNaN(price) || price < 0) {
      setAddError('กรุณากรอกชื่อ หมวดหมู่ และราคาที่ถูกต้อง');
      return;
    }
    setAddSubmitting(true);
    const { product: created, error } = await createProduct({ category_id, name, price });
    setAddSubmitting(false);
    if (created) {
      setAddOpen(false);
      setAddError(null);
      await loadProducts();
      useMenuStore.getState().loadMenu();
    } else {
      setAddError(error ?? 'ไม่สามารถเพิ่มเมนูได้ — ตรวจสอบการเชื่อมต่อหรือสิทธิ์');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;
    const form = e.currentTarget;
    const name = (form.elements.namedItem('edit-name') as HTMLInputElement).value.trim();
    const category_id = (form.elements.namedItem('edit-category_id') as HTMLSelectElement).value;
    const price = Number((form.elements.namedItem('edit-price') as HTMLInputElement).value);
    if (!name || !category_id || Number.isNaN(price) || price < 0) return;
    setEditSubmitting(true);
    const { product: updated, error } = await updateProduct(editingProduct.id, { category_id, name, price });
    setEditSubmitting(false);
    if (updated) {
      setEditingProduct(null);
      await loadProducts();
      useMenuStore.getState().loadMenu();
    } else if (error) {
      setEditError(error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setDeleteError(null);
    setDeleteSubmitting(true);
    const { success, error } = await deleteProduct(deletingProduct.id);
    setDeleteSubmitting(false);
    if (success) {
      setDeletingProduct(null);
      await loadProducts();
      useMenuStore.getState().loadMenu();
    } else {
      const friendlyMessage = error?.includes('foreign key') || error?.includes('violates')
        ? 'ลบไม่ได้ — เมนูนี้มีในคำสั่งซื้อเก่า ให้ปิดการขายแทนได้'
        : error ?? 'ไม่สามารถลบเมนูได้';
      setDeleteError(friendlyMessage);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[#e4e0d8] bg-white px-4 md:px-5 py-3 md:py-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg md:text-xl font-black leading-none mb-0.5">
              จัดการเมนู
            </h2>
            <p className="text-xs text-[#9a9288]">เพิ่ม แก้ไข และจัดหมวดหมู่เมนูอาหาร</p>
          </div>
          <button
            type="button"
            onClick={() => { setAddOpen(true); setAddError(null); }}
            className="md:hidden flex items-center justify-center w-10 h-10 bg-[#FA3E3E] rounded-full text-white touch-target shadow-md active:opacity-90"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="shrink-0 flex gap-2 p-3 md:p-3 border-b border-[#e4e0d8] bg-white">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9288]" />
          <input
            type="text"
            placeholder="ค้นหาเมนู..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#e4e0d8] rounded-xl md:rounded-lg py-3 md:py-2 px-3 pl-10 text-[#1a1816] text-sm md:text-[13px] focus:outline-none focus:border-[#FA3E3E] touch-target"
          />
        </div>
        <button
          type="button"
          className="hidden md:flex items-center gap-1.5 py-2 px-3.5 rounded-lg border border-[#e4e0d8] bg-transparent text-[#9a9288] text-xs font-bold hover:border-[#1a1816] hover:text-[#1a1816] transition-colors whitespace-nowrap"
        >
          <Tag className="w-3.5 h-3.5" />
          หมวดหมู่
        </button>
        <button
          type="button"
          onClick={() => {
            setAddOpen(true);
            setAddError(null);
          }}
          className="hidden md:flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-[#FA3E3E] border-none text-white text-xs font-extrabold cursor-pointer whitespace-nowrap hover:opacity-90"
        >
          + เพิ่มเมนู
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-4 momentum-scroll">
        {/* Categories */}
        <div className="flex items-center justify-between my-3 mb-2">
          <span className="text-[10px] font-extrabold text-[#9a9288] uppercase tracking-wider">
            หมวดหมู่
          </span>
          <button
            type="button"
            onClick={() => {
              setCategoryAddOpen(true);
              setCategoryAddError(null);
              setCategoryAddName('');
              setCategoryAddColor('#6b7280');
            }}
            className="text-[10px] font-bold text-[#FA3E3E] hover:underline"
          >
            + เพิ่มหมวดหมู่
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4 md:mb-4">
          {categoriesWithCount.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 py-2.5 md:py-2 px-3 bg-white border border-[#e4e0d8] rounded-xl md:rounded-[10px] text-xs font-bold touch-target active:bg-[#f7f5f0]"
            >
              <div
                className="w-2.5 h-2.5 md:w-2 md:h-2 rounded-full"
                style={{ background: c.color }}
              />
              <span>{c.name}</span>
              <span className="text-[11px] text-[#9a9288] bg-[#f7f5f0] px-1.5 py-0.5 rounded">{c.count}</span>
            </div>
          ))}
        </div>

        {/* Menu List Header */}
        <div className="flex items-center justify-between my-3 mb-2">
          <span className="text-[10px] font-extrabold text-[#9a9288] uppercase tracking-wider">
            เมนูทั้งหมด ({filteredMenu.length})
          </span>
        </div>

        {productsLoading ? (
          <div className="text-center py-10 text-[#9a9288] text-sm">กำลังโหลด...</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-[14px] border border-[#e4e0d8] overflow-hidden">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                      ชื่อเมนู
                    </th>
                    <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                      หมวดหมู่
                    </th>
                    <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                      ราคา
                    </th>
                    <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                      เปิดใช้งาน
                    </th>
                    <th className="text-left py-2 px-2.5 text-[10px] font-bold text-[#9a9288] uppercase tracking-wider border-b border-[#e4e0d8] bg-[#f7f5f0]">
                      {' '}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMenu.map((p) => {
                    const cat = categories.find((c) => c.id === p.cat);
                    return (
                      <tr key={p.id} className="hover:bg-[#f7f5f0]">
                        <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white font-bold">
                          {p.name}
                        </td>
                        <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white">
                          <span className="text-[11px] py-0.5 px-2 rounded-md bg-[#f7f5f0] text-[#6b6358]">
                            {cat?.name ?? p.cat}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white font-extrabold text-[#1a1816] font-heading">
                          {currency}{p.price}
                        </td>
                        <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white align-middle">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(p)}
                            disabled={togglingId === p.id}
                            className={`inline-flex shrink-0 h-5 w-9 min-w-[2.25rem] rounded-full border-none cursor-pointer relative transition-colors disabled:opacity-60 ${
                              p.is_active !== false ? 'bg-[#16a34a]' : 'bg-[#e4e0d8]'
                            }`}
                            aria-label={p.is_active !== false ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
                                p.is_active !== false ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="py-2.5 px-2.5 border-b border-[#e4e0d8] bg-white">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => { setEditingProduct(p); setEditError(null); }}
                              className="py-1.5 px-3 rounded-md border border-[#e4e0d8] bg-transparent text-[#9a9288] text-[11px] font-bold cursor-pointer hover:border-[#FA3E3E] hover:text-[#FA3E3E] transition-colors"
                            >
                              แก้ไข
                            </button>
                            <button
                              type="button"
                              onClick={() => { setDeletingProduct(p); setDeleteError(null); }}
                              className="p-1.5 rounded-md border border-transparent text-[#9a9288] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
                              aria-label="ลบเมนู"
                              title="ลบเมนู"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 pb-4">
              {filteredMenu.map((p) => {
                const cat = categories.find((c) => c.id === p.cat);
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl p-4 border border-[#e4e0d8] shadow-[0_1px_3px_rgba(0,0,0,0.04)] touch-target active:bg-[#f7f5f0]"
                  >
                    <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-[#1a1816] mb-1">{p.name}</h3>
                      <span className="inline-block text-[11px] py-1 px-2 rounded-md bg-[#f7f5f0] text-[#6b6358]">
                        {cat?.name ?? p.cat}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p)}
                        disabled={togglingId === p.id}
                        className={`inline-flex shrink-0 h-6 w-10 min-w-[2.5rem] rounded-full border-none cursor-pointer relative transition-colors disabled:opacity-60 ${
                          p.is_active !== false ? 'bg-[#16a34a]' : 'bg-[#e4e0d8]'
                        }`}
                        aria-label={p.is_active !== false ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
                            p.is_active !== false ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <ChevronRight className="w-5 h-5 text-[#9a9288]" />
                    </div>
                  </div>
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-lg font-extrabold text-[#1a1816]">
                        {currency}{p.price}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => { setEditingProduct(p); setEditError(null); }}
                          className="py-2 px-4 rounded-lg border border-[#e4e0d8] bg-transparent text-[#9a9288] text-xs font-bold touch-target active:border-[#FA3E3E] active:text-[#FA3E3E]"
                        >
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDeletingProduct(p); setDeleteError(null); }}
                          className="p-2 rounded-lg border border-transparent text-[#9a9288] active:text-[#dc2626] active:bg-[#fef2f2] touch-target"
                          aria-label="ลบเมนู"
                          title="ลบเมนู"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setAddError(null); }}>
        <DialogContent className="sm:max-w-[400px] border-[#e4e0d8]">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#1a1816]">เพิ่มเมนู</DialogTitle>
          </DialogHeader>
          <form key={addOpen ? 'add-open' : 'add-closed'} onSubmit={handleAddSubmit} className="space-y-4">
            {addError && (
              <div className="rounded-lg bg-[#fef2f2] border border-[#fecaca] px-3 py-2 text-sm text-[#dc2626]">
                {addError}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#9a9288]">ชื่อเมนู</Label>
              <Input
                name="name"
                required
                placeholder="เช่น กระเพราหมู"
                className="border-[#e4e0d8] focus:border-[#FA3E3E]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#9a9288]">หมวดหมู่</Label>
              <select
                name="category_id"
                required
                className="w-full min-h-11 rounded-md border border-[#e4e0d8] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#FA3E3E]"
              >
                <option value="">-- เลือกหมวดหมู่ --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#9a9288]">ราคา ({currency})</Label>
              <Input
                name="price"
                type="number"
                min={0}
                step={1}
                required
                placeholder="0"
                className="border-[#e4e0d8] focus:border-[#FA3E3E]"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="border-[#e4e0d8]" disabled={addSubmitting}>
                ยกเลิก
              </Button>
              <Button type="submit" className="bg-[#FA3E3E] hover:bg-[#FA3E3E]/90" disabled={addSubmitting}>
                {addSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => { if (!open) { setEditingProduct(null); setEditError(null); } }}>
        <DialogContent className="sm:max-w-[400px] border-[#e4e0d8]">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#1a1816]">แก้ไขเมนู</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {editError && (
                <div className="rounded-lg bg-[#fef2f2] border border-[#fecaca] px-3 py-2 text-sm text-[#dc2626]">
                  {editError}
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#9a9288]">ชื่อเมนู</Label>
                <Input
                  name="edit-name"
                  defaultValue={editingProduct.name}
                  required
                  className="border-[#e4e0d8] focus:border-[#FA3E3E]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#9a9288]">หมวดหมู่</Label>
                <select
                  name="edit-category_id"
                  defaultValue={editingProduct.cat}
                  required
                  className="w-full min-h-11 rounded-md border border-[#e4e0d8] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#FA3E3E]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#9a9288]">ราคา ({currency})</Label>
                <Input
                  name="edit-price"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={editingProduct.price}
                  required
                  className="border-[#e4e0d8] focus:border-[#FA3E3E]"
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setEditingProduct(null)} className="border-[#e4e0d8]" disabled={editSubmitting}>
                  ยกเลิก
                </Button>
                <Button type="submit" className="bg-[#FA3E3E] hover:bg-[#FA3E3E]/90" disabled={editSubmitting}>
                  {editSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={categoryAddOpen} onOpenChange={(open) => { setCategoryAddOpen(open); if (!open) setCategoryAddError(null); }}>
        <DialogContent className="sm:max-w-[400px] border-[#e4e0d8]">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#1a1816]">เพิ่มหมวดหมู่</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategorySubmit} className="space-y-4">
            {categoryAddError && (
              <div className="rounded-lg bg-[#fef2f2] border border-[#fecaca] px-3 py-2 text-sm text-[#dc2626]">
                {categoryAddError}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#9a9288]">ชื่อหมวดหมู่</Label>
              <Input
                value={categoryAddName}
                onChange={(e) => setCategoryAddName(e.target.value)}
                placeholder="เช่น ของหวาน"
                className="border-[#e4e0d8] focus:border-[#FA3E3E]"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#9a9288]">สี</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategoryAddColor(value)}
                    className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-colors ${
                      categoryAddColor === value
                        ? 'border-[#FA3E3E] bg-[#FA3E3E]/10 text-[#1a1816]'
                        : 'border-[#e4e0d8] bg-white text-[#6b6358] hover:bg-[#f7f5f0]'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: value }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setCategoryAddOpen(false)} className="border-[#e4e0d8]" disabled={categoryAddSubmitting}>
                ยกเลิก
              </Button>
              <Button type="submit" className="bg-[#FA3E3E] hover:bg-[#FA3E3E]/90" disabled={categoryAddSubmitting}>
                {categoryAddSubmitting ? 'กำลังบันทึก...' : 'เพิ่มหมวดหมู่'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation */}
      <Dialog open={!!deletingProduct} onOpenChange={(open) => { if (!open) { setDeletingProduct(null); setDeleteError(null); } }}>
        <DialogContent className="sm:max-w-[400px] border-[#e4e0d8]">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#1a1816]">ลบเมนู</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {deletingProduct && (
              <p className="text-sm text-[#6b6358]">
                ลบ &quot;{deletingProduct.name}&quot; ออกจากรายการเมนู? เมนูจะหายจากระบบ (คำสั่งซื้อเก่ายังมีบันทึก)
              </p>
            )}
            {deleteError && (
              <div className="rounded-lg bg-[#fef2f2] border border-[#fecaca] px-3 py-2 text-sm text-[#dc2626]">
                {deleteError}
              </div>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => { setDeletingProduct(null); setDeleteError(null); }} className="border-[#e4e0d8]" disabled={deleteSubmitting}>
                ยกเลิก
              </Button>
              <Button type="button" onClick={handleDeleteConfirm} className="bg-[#dc2626] hover:bg-[#dc2626]/90 text-white" disabled={deleteSubmitting}>
                {deleteSubmitting ? 'กำลังลบ...' : 'ลบเมนู'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
