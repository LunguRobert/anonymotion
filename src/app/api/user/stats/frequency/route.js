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
    select: { mood: true }
  })

  const frequency = {}

  for (const entry of entries) {
    frequency[entry.mood] = (frequency[entry.mood] || 0) + 1
  }

  return Response.json({ frequency })
}
