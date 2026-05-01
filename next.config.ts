import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow connections from any Vercel domain
  async headers() {
    return [];
  },
};

export default nextConfig;
