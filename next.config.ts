import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
