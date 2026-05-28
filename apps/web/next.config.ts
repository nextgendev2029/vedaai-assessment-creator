import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@vedaai/shared'],
  eslint: {
    // No eslint config exists in this project yet; skip during production build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
