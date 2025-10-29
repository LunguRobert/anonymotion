export const runtime = 'nodejs'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const userId = session.user.id

  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    select: {
      createdAt: true,
      mood: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  const moodByDate = {}

  for (const entry of entries) {
    const date = new Date(entry.createdAt).toISOString().split('T')[0]

    // dacă nu e deja setat, îl punem (1 emoție pe zi)
    if (!moodByDate[date]) {
      moodByDate[date] = entry.mood
    }
  }

  const sorted = Object.entries(moodByDate).map(([date, mood]) => ({
    date,
    mood,
  }))

  return Response.json({ data: sorted })
}
