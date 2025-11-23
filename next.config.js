/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // ✅ Turbopack configuration (Next.js 16 default)
  turbopack: {
    root: '.', // Set workspace root to current directory
  },
  
  // ✅ Performance optimizations
  // Note: swcMinify is enabled by default in Next.js 13+ and removed in Next.js 16
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep errors and warnings in production
    } : false,
  },
  
  // ✅ Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'swiper'], // Tree-shake unused exports
  },

  // ✅ Allow cross-origin requests in development mode
  // This allows the app to make requests to external APIs (like the Cloudflare Worker API)
  // during development without triggering Next.js security warnings
  // Also allows access from local network IPs (e.g., mobile devices on same network)
  allowedDevOrigins: [
    'https://softcream-api.mahmoud-zahran20025.workers.dev',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.1.132:3000', // Local network IP access (add more IPs as needed)
  ],
  
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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // ✅ Optimize image loading
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
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
