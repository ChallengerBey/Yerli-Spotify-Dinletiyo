import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript hatalarını build sırasında yoksay
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLint hatalarını build sırasında yoksay
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Vercel Image Optimization 402 hatasını önlemek için
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lastfm.freetls.fastly.net',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
      {
        protocol: 'https',
        hostname: '**.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },

      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-images.dzcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'cdns-images.dzcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'is1-ssl.mzstatic.com',
      },
      {
        protocol: 'https',
        hostname: '**.mzstatic.com',
      },
    ],
  },
};

export default nextConfig;