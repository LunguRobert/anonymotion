// app/api/my/posts/route.js
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import { enforceRateLimit } from '@/lib/rate-limit'

export async function GET(req) {
  const limited = await enforceRateLimit(req, 'common'); if (limited) return limited;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id
    const { searchParams } = new URL(req.url)

    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12', 10), 1), 50)
    const page = Math.max(parseInt(searchParams.get('page') || '0', 10), 0) // offset-based
    const q = (searchParams.get('q') || '').trim()
    const emotion = (searchParams.get('emotion') || '').trim().toUpperCase()
    const from = searchParams.get('from') // YYYY-MM-DD
    const to = searchParams.get('to')     // YYYY-MM-DD

    const where = { userId }
    if (q) where.content = { contains: q, mode: 'insensitive' }
    if (emotion) where.emotion = emotion
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(`${from}T00:00:00.000Z`)
      if (to)   where.createdAt.lte = new Date(`${to}T23:59:59.999Z`)
    }

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: { id: true, content: true, emotion: true, createdAt: true },
        take: limit,
        skip: page * limit,
      }),
      prisma.post.count({ where }),
    ])

    const ids = items.map(p => p.id)
    let reactions = []
    if (ids.length) {
      try {
        reactions = await prisma.reaction.groupBy({
          by: ['postId', 'type'],
          _count: { _all: true },
          where: { postId: { in: ids } },
        })
      } catch {
        reactions = []
      }
    }
    const reactionMap = {}
    for (const r of reactions) {
      const key = r.postId
      if (!reactionMap[key]) reactionMap[key] = {}
      reactionMap[key][r.type] = r._count._all
    }

    const enriched = items.map(p => ({
      ...p,
      reactions: reactionMap[p.id] || {},
    }))

    const hasMore = (page + 1) * limit < total
    return Response.json({ items: enriched, page, limit, total, hasMore })
  } catch (e) {
    console.error('GET /api/my/posts error:', e)
    const payload = { error: 'Internal Server Error' }
    if (process.env.NODE_ENV !== 'production') {
      payload.debug = { message: e?.message, code: e?.code }
    }
    return Response.json(payload, { status: 500 })
  }
}
