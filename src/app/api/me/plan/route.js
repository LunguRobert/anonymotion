// app/api/me/plan/route.js
export const runtime = 'nodejs'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    // anonim → tratăm ca FREE
    return Response.json({ plan: 'FREE' }, { status: 200 })
  }
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })
  return Response.json({ plan: me?.plan || 'FREE' }, { status: 200 })
}
