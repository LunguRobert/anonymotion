// src/lib/blog.js
import 'server-only'
import { unstable_cache } from 'next/cache'
import prisma from '@/lib/prisma'

/**
 * Returnează ultimele N articole publicate (doar metadate pentru homepage).
 * Rezultatul e cache-uit 1h și poate fi invalidat cu revalidateTag('blog').
 */
export const getLatestPosts = unstable_cache(
  async (limit = 3) => {
    const rows = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        tags: true,
        publishedAt: true,
        createdAt: true,
      },
    })

    return rows.map((p) => ({
      slug: p.slug,
      title: p.title || 'Untitled',
      excerpt: p.excerpt || '',
      // BlogTeaser așteaptă "date", "cover", "tag"
      date: (p.publishedAt || p.createdAt)?.toISOString?.() || '',
      cover: p.coverImage || '',
      tag: Array.isArray(p.tags) && p.tags.length ? p.tags[0] : '',
    }))
  },
  ['blog:latest'],
  { revalidate: 3600, tags: ['blog'] } // 1 oră
)
