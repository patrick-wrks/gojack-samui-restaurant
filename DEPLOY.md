# Cloudflare Pages Deployment

This Next.js app is configured for **Cloudflare Pages** (no Vercel).

## Build

- **Build command:** `npx @cloudflare/next-on-pages`
- **Build output directory:** See the [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages) documentation for the current adapter version. In the Cloudflare Pages dashboard (Settings → Builds), set the output directory to the path specified there so Pages picks up the built assets.

## Environment variables

In Cloudflare Pages (Settings → Environment variables), add:

- `NEXT_PUBLIC_SUPABASE_URL` – your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – your Supabase anon/public key

These are used for the Supabase client and real-time subscriptions. If they are not set, the app runs with in-memory data only.

## Local development

- `npm run dev` – run the Next.js dev server
- `npm run pages:build` – build for Cloudflare Pages (run before `wrangler pages dev` if you use it)

## Supabase

1. Create a Supabase project and run `schema.sql` in the SQL Editor.
2. Enable Realtime for the `orders` table (the schema includes `ALTER PUBLICATION supabase_realtime ADD TABLE orders`).
3. Add the env vars above so the app can connect and receive real-time order updates on the Reports page.
