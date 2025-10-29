export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { isAdminEmail } from '@/lib/authz'
import { slugify } from '@/lib/slugify'
import { enforceRateLimit } from '@/lib/rate-limit'
import { assertSameOrigin } from '@/lib/same-origin'

export async function GET(req) {
  const limited = await enforceRateLimit(req, 'strict'); if (limited) return limited;
  const badOrigin = assertSameOrigin(req); if (badOrigin) return badOrigin;
  
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || 1)
  const limit = Math.min(Number(searchParams.get('limit') || 10), 50)
  const draft = searchParams.get('draft') === '1' // admin preview of drafts

  const where = draft ? {} : { published: true }
  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, published: true, publishedAt: true, createdAt: true, tags: true }
    }),
    prisma.blogPost.count({ where })
  ])

  return NextResponse.json({ items, total, page, limit })
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { title, content, excerpt = '', coverImage = '', tags = [], published = false } = body || {}

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  // ensure unique slug
  let base = slugify(title)
  let slug = base
  let i = 1
  // check for clashes
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`
  }

  const now = new Date()
  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      tags,
      published,
      publishedAt: published ? now : null,
      authorId: session?.user?.id || null
    },
    select: { id: true, slug: true }
  })

  return NextResponse.json({ ok: true, post })
}
