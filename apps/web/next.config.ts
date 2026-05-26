import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@skillmango/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
  },
};

export default nextConfig;