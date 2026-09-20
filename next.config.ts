import type { NextConfig } from 'next';

// Same-origin proxy for the external API. Browsers call /api/backend/*
// (no CORS preflight against the backend origin); the server forwards to
// the real backend. Override with BACKEND_PROXY_TARGET when needed.
const BACKEND_TARGET =
  process.env.BACKEND_PROXY_TARGET || 'https://tadreebak-e285.onbelmo.uk/api/v1';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.7', '192.168.1.11'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${BACKEND_TARGET}/:path*`,
      },
    ];
  },
};

export default nextConfig;
