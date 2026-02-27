import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Confine tracing to this project when multiple lockfiles exist
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
