// app/sitemap.js
import prisma from '@/lib/prisma'

export const revalidate = 3600 // re-generate every hour

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://anonymotions.com'

  // 1) Static routes (complete as needed)
  const staticPaths = [
    '/', '/blog', '/pricing', '/signup',
    '/legal/terms', '/legal/privacy',
  ]

  const staticEntries = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '/' ? 1.0 : 0.7,
  }))

  // 2) Blog posts (published only)
  let postEntries = []
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
      take: 5000, // safety cap
    })

    postEntries = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt ?? p.publishedAt ?? new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }))
  } catch (e) {
    console.error('SITEMAP_BLOG_ERROR', e)
  }

  return [...staticEntries, ...postEntries]
}
