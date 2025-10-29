// /app/api/dev/reset-journal/route.js
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { enforceRateLimit } from '@/lib/rate-limit'
import { assertSameOrigin } from '@/lib/same-origin'

export async function POST(req) {
  const limited = await enforceRateLimit(req, 'strict'); if (limited) return limited;
  const badOrigin = assertSameOrigin(req); if (badOrigin) return badOrigin;

  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }

  try {
    await prisma.journalEntry.deleteMany()
    return NextResponse.json({ message: 'Journal entries reset successfully' })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json({ error: 'Failed to reset journal entries' }, { status: 500 })
  }
}
