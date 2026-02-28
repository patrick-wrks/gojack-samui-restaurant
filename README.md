This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

For a faster dev server (Turbopack), use `npm run dev:turbo`. If you see Tailwind classes not applying with Turbopack, use `npm run dev` (webpack) until Tailwind v4 + Turbopack support improves.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

### Styling (Tailwind v4 + shadcn/ui)

- **Single source of truth**: Theme tokens live in `src/app/globals.css`. `@theme inline` holds Tailwind design tokens (e.g. `--radius: 14px`); `:root` holds semantic tokens for shadcn (e.g. `--background`, `--foreground`). Do not redefine `--radius` in `:root` to avoid conflicts.
- **Import order**: `tailwindcss` → `tw-animate-css` → `shadcn/tailwind.css`, then app overrides.
- **Turbopack**: Use `npm run dev:turbo` for faster HMR; if CSS behaves oddly, use `npm run dev`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
