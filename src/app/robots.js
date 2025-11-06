// app/robots.js
export const runtime = 'nodejs'

export default function robots() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://anonymotions.com'

  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/admin', '/api', '/user', '/feed'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
