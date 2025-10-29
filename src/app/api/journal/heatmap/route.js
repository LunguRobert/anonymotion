// app/api/journal/heatmap/route.js
export const runtime = 'nodejs'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(req) {
  const limited = await enforceRateLimit(req, "common");
  if (limited) return limited;

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get('year') || new Date().getFullYear(), 10)
  // month: 1-12 în query; îl convertim la index 0-11 pentru Date()
  const month1to12 = parseInt(searchParams.get('month') || (new Date().getMonth() + 1), 10)
  const monthIdx = month1to12 - 1

  // interval: [start, nextMonth)
  const start = new Date(year, monthIdx, 1)
  const nextMonth = new Date(year, monthIdx + 1, 1)

  const entries = await prisma.journalEntry.findMany({
    where: {
      userId: session.user.id,
      createdAt: {
        gte: start,
        lt: nextMonth,
      },
    },
    select: { createdAt: true, mood: true },
    orderBy: { createdAt: 'asc' },
  })

  // map pe zile "YYYY-MM-DD" -> mood (ultima intrare a zilei câștigă)
  const byDay = {}
  for (const e of entries) {
    const iso = e.createdAt.toISOString().split('T')[0]
    byDay[iso] = e.mood
  }

  return Response.json({ data: byDay })
}
