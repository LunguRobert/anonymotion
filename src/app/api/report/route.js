export const runtime = 'nodejs'

import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req) {
  const limited = await enforceRateLimit(req, "strict");
  if (limited) return limited;

  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { postId, reason } = await req.json()
  const userId = session.user.id

  const existing = await prisma.report.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      }
    }
  })

  if (existing) {
    return new Response('Already reported', { status: 200 })
  }

  await prisma.report.create({
    data: { postId, userId, reason }
  })

  return new Response('Report submitted', { status: 201 })
}
