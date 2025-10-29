// app/api/auth/password/reset/confirm/route.js
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { enforceRateLimit } from '@/lib/rate-limit'
import { assertSameOrigin } from '@/lib/same-origin'
import { hash } from 'bcryptjs'

function isStrong(pw) {
  if (typeof pw !== 'string') return false
  // minim 8, literă, cifră sau simbol
  return pw.length >= 8 && /[A-Za-z]/.test(pw) && /(\d|[^A-Za-z0-9])/.test(pw)
}

export async function POST(req) {
  const limited = await enforceRateLimit(req, 'login')
  if (limited) return limited

  // protecție CSRF pt. endpoint-ul care schimbă parola
  const badOrigin = assertSameOrigin(req)
  if (badOrigin) return badOrigin

  try {
    const { token, password } = await req.json()
    if (!token || !isStrong(password)) {
      return NextResponse.json({ error: 'Invalid token or weak password.' }, { status: 400 })
    }

    const rec = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!rec || rec.expires < new Date()) {
      // token inexistent/expirat → ștergem orice rămășițe, răspuns generic
      if (rec?.identifier) {
        await prisma.passwordResetToken.deleteMany({ where: { identifier: rec.identifier } })
      }
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 })
    }

    const email = rec.identifier
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      await prisma.passwordResetToken.deleteMany({ where: { identifier: email } })
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 })
    }

    const hashed = await hash(password, 12)
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
      prisma.passwordResetToken.deleteMany({ where: { identifier: email } }),
      // revocăm sesiuni bazate pe DB (ex. OAuth). La JWT, nu există sesiuni persistente.
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ])

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('reset/confirm error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
