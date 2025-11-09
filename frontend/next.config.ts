import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Optional: for future production builds
  output: 'standalone',
};

export default nextConfig;
