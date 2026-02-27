# Deployment Troubleshooting Guide

## Quick Fixes for Common Issues

### Issue: "Unknown arguments: compatibility-flags"
**Fix**: Already resolved. The workflow no longer uses deprecated flags.

### Issue: "Could not find project"
**Fix**: Create project in Cloudflare Dashboard → Pages → "Create a project" → Choose "Upload an asset"

### Issue: "Unauthorized" or "Invalid API token"
**Fix**: Regenerate Cloudflare API token with permissions:
- Account: Cloudflare Pages:Edit
- Account: Account:Read

### Issue: Build fails with "Cannot find module"
**Fix**: Run locally:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: "Project name already exists"
**Fix**: Use a different project name in `wrangler.toml` and the deploy command.

---

## Future-Proofing Checklist

### Monthly Maintenance
- [ ] Check if GitHub Actions shows any deprecation warnings
- [ ] Test deployment on a staging branch before pushing to main
- [ ] Review Cloudflare Pages dashboard for any alerts

### When Things Break
1. Check GitHub Actions logs first (usually tells you exactly what's wrong)
2. Verify secrets are still valid (especially API tokens can expire)
3. Test build locally with `npm run pages:build`
4. Check Cloudflare status page if deployment hangs

---

## What Could Go Wrong (Honest Assessment)

### Likely Issues (Check these first)
1. **API Token expires** - Cloudflare tokens can expire; regenerate if needed
2. **Supabase credentials change** - If you rotate keys, update GitHub secrets
3. **Node.js version** - Currently pinned to v20, but future updates may need adjustments
4. **npm package updates** - Major version updates can break builds

### Unlikely Issues
1. Cloudflare service outage (rare)
2. GitHub Actions service issues (very rare)

---

## Current Setup Resilience

✅ **Build process**: Uses lockfile (`package-lock.json`) for reproducible installs  
✅ **Node version**: Pinned to v20 (LTS) for stability  
✅ **Secrets check**: Workflow now verifies secrets exist before building  
✅ **Build verification**: Checks output exists before deploying  
✅ **Concurrency**: Prevents overlapping deployments  

---

## Emergency Rollback

If a deployment breaks your site:

```bash
# Revert to last known good commit
git log --oneline  # find the good commit
git revert <bad-commit-hash>
git push origin main
```

Or manually in GitHub:
1. Go to repo → Actions → Find last successful deployment
2. Click "Re-run jobs" to redeploy that version
