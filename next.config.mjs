// next.config.mjs
// — Security + images config —

// Content Security Policy (strict, dar compatibil cu Next și login Google).
// Ajustează domeniile din script-src / connect-src dacă adaugi alte servicii (ex. Hotjar).
const ContentSecurityPolicy = `
  default-src 'self';
  base-uri 'self';
  frame-ancestors 'none';
  object-src 'none';
  form-action 'self';
  upgrade-insecure-requests;

  img-src 'self' data: blob: https:;
  font-src 'self' https: data:;
  style-src 'self' 'unsafe-inline' https:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com;
  connect-src 'self' https: wss:;
  frame-src 'self' https://accounts.google.com;
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com', pathname: '/**' },
      // Adaugă aici alte domenii pe care le folosești pentru imagini:
      // { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      // { protocol: 'https', hostname: 'your-cdn.example.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        // aplică headerele de securitate pentru toate rutele
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // nu indexăm zona de admin
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
    ];
  },
};

export default nextConfig;
