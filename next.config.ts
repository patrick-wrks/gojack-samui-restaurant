import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev server access from other devices (e.g. phone at 172.20.10.7)
  allowedDevOrigins: ['http://172.20.10.7:3000', 'http://localhost:3000'],
  // Confine tracing to this project when multiple lockfiles exist
  outputFileTracingRoot: process.cwd(),
  // Output static files for Cloudflare Pages
  output: 'export',
  // Disable image optimization since we're doing static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
