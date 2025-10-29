// app/api/journal/route.js
export const runtime = 'nodejs'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import { enforceRateLimit } from "@/lib/rate-limit";
import { cookies } from 'next/headers'

async function guardJournalLock(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { journalLockEnabled: true }
  })
  if (!user?.journalLockEnabled) return null

  const unlocked = cookies().get('journal-unlocked')?.value
  if (unlocked === '1') return null

  return new Response(JSON.stringify({ error: 'LOCKED' }), { status: 403 })
}


export async function POST(req) {
  const limited = await enforceRateLimit(req, "strict");
  if (limited) return limited;

  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 })
  }

  const lockRes = await guardJournalLock(session.user.id)
  if (lockRes) return lockRes

  const body = await req.json()
  const { content, mood } = body

  if (!content || !mood) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })
  }

  try {
    const entry = await prisma.journalEntry.create({
      data: {
        content,
        mood,
        userId: session.user.id,
      },
    })

    return new Response(JSON.stringify({ entry }), { status: 201 })

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'Failed to create entry' }), { status: 500 })
  }
}

// /api/journal/route.js
export async function GET(req) {
  const limited = await enforceRateLimit(req, "common");
  if (limited) return limited;

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 })

  const lockRes = await guardJournalLock(session.user.id)
  if (lockRes) return lockRes

  const { searchParams } = new URL(req.url)
  const limitRaw = Number(searchParams.get('limit') ?? '10')
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(100, limitRaw)) : 10

  const cursor = searchParams.get('cursor')
  const emotion = searchParams.get('emotion')
  const query = searchParams.get('query')

  const where = {
    userId: session.user.id, // ✅ obligatoriu
    ...(emotion && { mood: emotion }),
    ...(query && {
      content: {
        contains: query,
        mode: 'insensitive',
      },
    }),
    ...(cursor && { createdAt: { lt: new Date(cursor) } }),
  }

  const entries = await prisma.journalEntry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
  })

  const hasMore = entries.length > limit
  const result = hasMore ? entries.slice(0, limit) : entries
  const nextCursor = hasMore ? (entries[limit]?.createdAt ?? null) : null

  return Response.json({
    entries: result,
    nextCursor,
  })

}


export async function PUT(req) {
  const limited = await enforceRateLimit(req, "strict");
  if (limited) return limited;

  const session = await getServerSession(authOptions)
  const body = await req.json()
  const { id, content, mood } = body


  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 })
  }
  const lockRes = await guardJournalLock(session.user.id)
  if (lockRes) return lockRes

  if (!id || !content || !mood) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })
  }

  try {
    const { count } = await prisma.journalEntry.updateMany({
      where: { id, userId: session.user.id },
      data: { content, mood }
    })
    if (count === 0) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 })

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to update' }), { status: 500 })
  }
}

export async function DELETE(req) {
  const limited = await enforceRateLimit(req, "strict");
  if (limited) return limited;

  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 })
  }
  const lockRes = await guardJournalLock(session.user.id)
  if (lockRes) return lockRes

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 })
  }

  try {
    const { count } = await prisma.journalEntry.deleteMany({
      where: { id, userId: session.user.id }
    })
    if (count === 0) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Delete failed' }), { status: 500 })
  }
}
