# Supabase setup

## Run migrations

### Phase 2: Menu (001_menu.sql)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **SQL Editor** → **New query**.
3. Copy the contents of `migrations/001_menu.sql` and paste into the editor.
4. Click **Run**. This creates `categories` and `products` tables, enables RLS, and seeds data from the app's default menu.

After this, the app will load the menu from the database.

### Phase 3: Store settings (002_store.sql)

1. In the SQL Editor, run the contents of `migrations/002_store.sql`.
2. This creates the `store` table (single row: id = 1) with store name, address, phone, currency symbol, tax rate, and prices-include-tax. RLS is enabled for authenticated users.
3. The Settings page and all currency/tax displays will use these values.
