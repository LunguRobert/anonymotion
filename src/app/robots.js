// app/robots.js
export const runtime = 'nodejs';

export default function robots() {
  return {
    rules: [
      { userAgent: '*', disallow: ['/admin', '/api'] },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
  }
}