# Cloudflare Pages Deployment

This Next.js app is configured for **Cloudflare Pages** with automatic deployment from GitHub.

## Automatic Deployment (GitHub → Cloudflare)

Every push to `main` or `master` branch automatically deploys to Cloudflare Pages.

### Setup Steps (One-time)

1. **Create a Cloudflare API Token**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → My Profile → API Tokens
   - Create Token → Use "Custom token" template
   - Permissions:
     - Zone:Read (if using custom domain)
     - Account:Read
     - Cloudflare Pages:Edit
   - Copy the generated token

2. **Get your Cloudflare Account ID**:
   - In Cloudflare Dashboard, look at the right sidebar on any domain
   - Or find it in the URL: `dash.cloudflare.com/<ACCOUNT_ID>/...`

3. **Add GitHub Secrets**:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add the following secrets:
     | Secret Name | Value |
     |-------------|-------|
     | `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token from step 1 |
     | `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID from step 2 |
     | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
     | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

4. **Create Cloudflare Pages Project** (if not exists):
   - Cloudflare Dashboard → Pages → Create a project
   - Choose "Direct Upload" (not Git integration)
   - Project name: `gojack-samui-restaurant`
   - The GitHub Action will handle uploads

That's it! Now every push to `main` will automatically build and deploy.

## Manual Deploy (Backup Method)

If you need to deploy manually:

```bash
# Build and deploy in one command
npm run deploy
```

Or step by step:
```bash
npm run pages:build
wrangler pages deploy .vercel/output/static
```

## Build Configuration

- **Build command:** `npm run pages:build` (runs `npx @cloudflare/next-on-pages`)
- **Build output directory:** `.vercel/output/static`
- **Config file:** `wrangler.toml`

## Local Development

```bash
# Run the Next.js dev server (http://localhost:3000)
npm run dev

# Test production build locally
npm run pages:build
npx serve .vercel/output/static
```

## Supabase Setup

1. Create a Supabase project and run `schema.sql` in the SQL Editor.
2. Enable Realtime for the `orders` table (the schema includes `ALTER PUBLICATION supabase_realtime ADD TABLE orders`).
3. Add Supabase env vars to GitHub Secrets so the build can access them.
