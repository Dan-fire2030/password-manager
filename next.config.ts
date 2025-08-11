import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add timeout configurations for production
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  // Optimize for production timeouts
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
