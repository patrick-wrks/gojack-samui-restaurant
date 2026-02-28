# Cloudflare Pages Deployment ✓

This Next.js app is configured for **Cloudflare Pages** with automatic deployment from GitHub.

## How It Works

```
GitHub (your code) → GitHub Actions (builds) → Cloudflare Pages (hosts) → your domain
```

- Your code lives on **GitHub** (version history, rollbacks)
- **GitHub Actions** automatically builds on every push
- **Cloudflare Pages** hosts and serves your app
- Your domain `gojack-samui.com` points to Cloudflare Pages

## Setup Steps

### 1. Configure GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret

Add these 4 secrets:

| Secret Name | How to Get It |
|-------------|---------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → Create Token. Use "Custom token" with permissions: Account:Read, Cloudflare Pages:Edit |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → any domain page, look at right sidebar for Account ID |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → Project API keys → `anon/public` |

### 2. Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Pages** in left sidebar
3. Click **"Create a project"**
4. Choose **"Upload an asset"** (not "Connect to Git")
5. Project name: `gojack-samui-restaurant`
6. Click **"Create project"**

The GitHub Action will handle all uploads automatically.

### 3. Connect Your Domain

1. In your Cloudflare Pages project, go to **"Custom domains"** tab
2. Click **"Set up a custom domain"**
3. Enter: `gojack-samui.com`
4. Click **"Continue"**
5. Cloudflare will configure DNS automatically

**Note:** If your domain DNS is managed outside Cloudflare, you'll need to manually add a CNAME record:
- Name: `@` (or `gojack-samui.com`)
- Target: `gojack-samui-restaurant.pages.dev`

### 4. Push to Deploy

```bash
git push origin main
```

Go to GitHub repo → Actions tab to watch the deployment.

## Checking Deployment Status

1. **GitHub Actions**: GitHub repo → Actions tab
2. **Cloudflare Pages**: Dashboard → Pages → gojack-samui-restaurant

## Rollback (Go Back in Time)

Since your code is on GitHub, rollback is easy:

```bash
# View history
git log --oneline

# Revert to a specific commit
git revert abc1234
git push origin main

# OR reset to an earlier commit (destructive)
git reset --hard abc1234
git push origin main --force
```

## Local Development

```bash
# Run dev server
npm run dev

# Build and test production locally
npm run pages:build
npx serve .vercel/output/static
```

## Troubleshooting

### "Project not found" error in GitHub Actions
- Make sure you created the Cloudflare Pages project (Step 2 above)
- Verify the project name matches: `gojack-samui-restaurant`

### Domain shows old GitHub Pages
- Check DNS records in Cloudflare Dashboard
- Make sure CNAME points to Cloudflare Pages, not GitHub

### Build fails
- Check GitHub Actions logs for specific errors
- Verify all 4 secrets are set correctly

### Login shows "แอปยังไม่ได้ตั้งค่า (ไม่มี Supabase)"
- Auth requires Supabase. If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing (or wrong), the app disables login and shows this message. Add both secrets in GitHub Actions and set the same env vars in Cloudflare Pages (Settings → Environment variables) so the built app can authenticate staff.
