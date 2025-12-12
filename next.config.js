/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

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
    const isProd = process.env.NODE_ENV === 'production';

    return [
      {
        source: '/:path*',
        headers: [
          // ✅ DNS & Performance
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // ✅ Clickjacking Protection
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          // ✅ MIME Sniffing Protection
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // ✅ XSS Protection (legacy but still useful)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // ✅ Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // ✅ HSTS - Force HTTPS (production only)
          ...(isProd ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }] : []),
          // ✅ Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://softcream-api.mahmoud-zahran20025.workers.dev https://*.cloudflare.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          },
          // ✅ Permissions Policy (Feature Policy successor)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=(self)'
          }
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
