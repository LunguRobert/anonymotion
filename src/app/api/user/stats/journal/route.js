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
      id: true,
      createdAt: true,
      mood: true,
    },
  })

  const byDay = {}

  for (const entry of entries) {
    const day = new Date(entry.createdAt).toISOString().split('T')[0]

    // Dacă există deja o zi, suprascriem doar dacă este o emoție mai "intensă"
    if (!byDay[day]) {
      byDay[day] = entry.mood
    }
  }

  return Response.json({ data: byDay })
}
