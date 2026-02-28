# Production readiness plan

**Goal:** One restaurant, 3–5 staff. Secure, maintainable, then extend later.

**Current state:** POS works, orders save to Supabase when configured, auth and menu are demo-only.

---

## Phase 1: Real auth (Supabase Auth)

**Why first:** Protects the app before any real data or settings.

| Task | Details |
|------|--------|
| Enable Supabase Auth | In Supabase: Authentication → Providers → Email (and optionally Magic Link). Create 3–5 user accounts (invite or sign-up). |
| Replace in-memory auth | Use `supabase.auth.getSession()` / `onAuthStateChange()` in `AuthProvider`; persist session (e.g. cookie/localStorage via Supabase client). |
| Login form | Call `supabase.auth.signInWithPassword({ email, password })`; on success, redirect to `/pos`. Show clear error on failure. |
| Logout | Call `supabase.auth.signOut()` and clear client state; redirect to `/`. |
| AuthGuard | Keep redirect to `/` when not logged in; derive “logged in” from Supabase session. |
| RLS (optional but recommended) | Add Row Level Security on `orders` and `order_items` so only authenticated users can read/write. |

**Outcome:** Only staff with real Supabase accounts can use the app; session survives refresh.

**No Supabase env:** If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing, the app shows "แอปยังไม่ได้ตั้งค่า (ไม่มี Supabase)" on the login page and login is disabled (no demo bypass). Set both env vars in Cloudflare Pages and GitHub Actions secrets for production.

## Phase 2: Menu in the database

**Why second:** Restaurant can change prices and items without code deploys; reports can use real product data.

### Supabase schema

- **categories**  
  - `id` (text, PK), `name` (text), `color` (text), `sort_order` (int, optional).  
  - Seed from `CATS` in `src/lib/constants.ts` (drop `id: 'all'` or handle in app as “all” only in UI).

- **products**  
  - `id` (uuid or serial PK), `category_id` (FK → categories), `name` (text), `price` (numeric), `is_active` (bool, default true), `sort_order` (int, optional).

- **order_items**  
  - Add or use `product_id` (FK → products, nullable) so existing `product_name`/`price_at_sale` remain for history; new orders can link to `products.id`.

### App changes

| Task | Details |
|------|--------|
| Seed data | One-time script or SQL: insert categories and products from current `MENU`/`CATS` (map `cat` → `category_id`). |
| Load menu in app | Replace reading from `constants`: fetch categories and products from Supabase (e.g. `categories` order by `sort_order`, `products` where `is_active` order by `sort_order`/name). |
| POS | `MenuGrid` and cart use API/DB menu; cart still stores product id + name + price for the order. |
| Products page | List products from DB; “เพิ่มเมนู” / “แก้ไข” do real insert/update in Supabase. Defer “หมวดหมู่” management if you want (can be Phase 2b). |

**Outcome:** Menu is editable in the app; POS and orders use DB; you can later add reports by product.

---

## Phase 3: Key settings in the database

**Why third:** Store name, address, phone, tax, currency in one place; optional for go-live if you’re okay with hardcoded defaults.

### Option A – Single row / key–value

- Table **settings** with `key` (text, PK) and `value` (jsonb or text).  
- Keys e.g. `store_name`, `store_address`, `store_phone`, `currency_symbol`, `tax_rate`, `prices_include_tax`.  
- App reads once (or with a small cache) and uses in Settings UI and in POS (e.g. currency symbol, tax in totals).

### Option B – One “store” row

- Table **store**: columns for name, address, phone, currency_symbol, tax_rate, prices_include_tax, etc.  
- Single row; app fetches and uses in Settings and POS.

### App changes

| Task | Details |
|------|--------|
| Settings UI | “บันทึก” in ข้อมูลร้าน and ภาษี/สกุลเงิน writes to Supabase (upsert store or settings rows). Load existing values on page open. |
| POS / Cart | Use store currency symbol (and optionally tax) from DB instead of hardcoded ฿. |
| Optional | “ส่งออกออเดอร์” / “ส่งออกเมนู” can be a later feature (e.g. CSV from orders/products). |

**Outcome:** Key business settings are editable and consistent across the app.

---

## Order of work and deployment

1. **Phase 1** → deploy with real auth. Confirm only staff can log in and that orders still save (Supabase env + tables already in place).
2. **Phase 2** → add categories + products, migrate menu, then switch POS and Products page to DB. Deploy.
3. **Phase 3** → add settings/store table and wire Settings page + POS. Deploy (or ship Phase 2 first and do Phase 3 right after).

---

## After production

- Reports can be switched from mock data to Supabase: aggregate from `orders` and `order_items` (and optionally `products`) for revenue, top dishes, payment mix, etc.
- New features (e.g. tables, kitchen display, discounts) can build on this: same auth, same products/orders, same settings.

---

## Checklist before first production deploy

- [ ] Supabase project created; env vars set in Cloudflare (or your host) and in GitHub Actions if you use CI.
- [ ] `orders` and `order_items` tables exist and are writable by the app (and optionally protected by RLS for authenticated users).
- [ ] Phase 1 done: login uses Supabase Auth, session persists, only staff can access `/pos` and below.
- [ ] Confirmed: place a test order and see it in Supabase.
- [ ] Domain and SSL (e.g. Cloudflare Pages) configured as in `DEPLOY.md`.

Once Phase 1 is done and this checklist is green, you’re in a good position to push to production for the single restaurant and then add Phase 2 and 3 as a short follow-up.
