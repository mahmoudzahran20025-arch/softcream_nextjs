/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: 'softcream-api.mahmoud-zahran20025.workers.dev',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://softcream-api.mahmoud-zahran20025.workers.dev',
  },


  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
    ];
  },

  // Redirects for API proxy (optional - can be removed if not needed)
  // async rewrites() {
  //   return {
  //     beforeFiles: [
  //       {
  //         source: '/api/:path*',
  //         destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
  //       },
  //     ],
  //   };
  // },
};

module.exports = nextConfig;
