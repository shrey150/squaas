import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Optional: for future production builds
  output: 'standalone',
  
  // Proxy API requests to backend
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:8787/:path*',
      },
    ];
  },
};

export default nextConfig;
