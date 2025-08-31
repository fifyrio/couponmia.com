import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-d4a6e4bb69c749d08347ce9216e8201a.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'www.brandreward.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.brandreward.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.worthepenny.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tryastro.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development', // Allow unoptimized images in dev
  },
};

export default nextConfig;
