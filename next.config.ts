import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization settings (critical for CPU reduction)
  images: {
    // Enable image optimization in production (reduces 20-30% CPU usage)
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev',
      },
      {
        protocol: 'http',
        hostname: 'www.brandreward.com',
      },
      {
        protocol: 'https',
        hostname: 'www.brandreward.com',
      },
      {
        protocol: 'https',
        hostname: 'image.worthepenny.com',
      },
      {
        protocol: 'https',
        hostname: 'tryastro.app',
      },
      {
        protocol: 'https',
        hostname: '**.com',
      },
      {
        protocol: 'https',
        hostname: '**.app',
      },
      {
        protocol: 'https',
        hostname: '**.io',
      },
      {
        protocol: 'https',
        hostname: '**.co',
      },
      {
        protocol: 'http',
        hostname: '**.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev', // Cloudflare R2
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Supabase Storage
      },
    ],
  },

  // Production build optimizations
  output: 'standalone',
  compress: true,

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
