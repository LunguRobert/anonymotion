export const runtime = 'nodejs'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { enforceRateLimit } from '@/lib/rate-limit'
import { assertSameOrigin } from '@/lib/same-origin'

export async function POST(req) {
  const limited = await enforceRateLimit(req, 'strict'); if (limited) return limited;
  const badOrigin = assertSameOrigin(req); if (badOrigin) return badOrigin;

  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const data = await req.formData()
  const timezone = data.get('timezone')

  if (!timezone) return new NextResponse('Missing timezone', { status: 400 })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { timezone }
  })

  return NextResponse.redirect('/user')
}
