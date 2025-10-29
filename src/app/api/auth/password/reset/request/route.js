// app/api/auth/password/reset/request/route.js
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { enforceRateLimit } from '@/lib/rate-limit'
import { createPasswordResetToken, sendPasswordResetEmail } from '@/lib/passwordReset'

export async function POST(req) {
  const limited = await enforceRateLimit(req, 'login')
  if (limited) return limited

  try {
    const { email } = await req.json()
    const normalized = String(email || '').trim().toLowerCase()
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      // răspuns generic pt. a evita user-enumeration
      return NextResponse.json({ ok: true })
    }

    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { emailVerified: true },
    })

    // Nu dezvălui nimic despre existența contului.
    if (!user || !user.emailVerified) {
      return NextResponse.json({ ok: true })
    }

    const { resetUrl } = await createPasswordResetToken(normalized)
    await sendPasswordResetEmail(normalized, resetUrl)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('reset/request error', e)
    return NextResponse.json({ ok: true }) // tot generic
  }
}
