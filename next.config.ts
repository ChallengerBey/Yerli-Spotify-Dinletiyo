import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', 
        port: '',
        pathname: '/**',
      }
    ],
    unoptimized: process.env.NODE_ENV === 'development',
    domains: [
      'i.ytimg.com',
      'cn2.mainnet.audiusindex.org',
      'audius-cn1.tikilabs.com',
      'audius-discovery-1.cultur3stake.com',
      'audius-discovery-1.theblueprint.xyz',
      'audius-discovery-11.cultur3stake.com',
      'audius-discovery-12.cultur3stake.com',
      'audius-discovery-13.cultur3stake.com',
      'dn1.monophonic.digital',
      'dn1.nodeoperator.io',
      'dn1.stuffisup.com',
      '*.tikilabs.com',
      '*.audius.co',
      '*.audius.org',
    ],
  },
};

export default nextConfig;
