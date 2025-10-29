import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

function json(data, status = 200) {
  return NextResponse.json(data, { status })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return json({ error: 'Unauthorized' }, 401)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      journalLockEnabled: true,
      journalPasswordHash: true,
      journalLockHint: true,
    },
  })

  const isPremium = !!user?.plan && user.plan !== 'FREE'

  return json({
    enabled: !!user?.journalLockEnabled,
    hint: user?.journalLockHint || '',
    isPremium,
  })
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return json({ error: 'Unauthorized' }, 401)

  const body = await req.json().catch(() => ({}))
  const { enabled, newPassword, hint, currentPassword } = body

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      journalLockEnabled: true,
      journalPasswordHash: true,
    },
  })
  const isPremium = !!user?.plan && user.plan !== 'FREE'

  // ENABLE or CHANGE PASSWORD
  if (enabled === true) {
    if (!isPremium) return json({ error: 'Premium required' }, 402)

    if (!newPassword || String(newPassword).length < 4) {
      return json({ error: 'Password too short' }, 400)
    }

    // dacă e deja activ, cere parola curentă pentru schimbare
    if (user?.journalLockEnabled && user?.journalPasswordHash) {
      if (!currentPassword) return json({ error: 'Current password required' }, 400)
      const ok = await bcrypt.compare(String(currentPassword), user.journalPasswordHash)
      if (!ok) return json({ error: 'Invalid current password' }, 401)
    }

    const hash = await bcrypt.hash(String(newPassword), 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        journalLockEnabled: true,
        journalPasswordHash: hash,
        journalLockHint: hint || '',
      },
    })
    return json({ ok: true })
  }

  // DISABLE (necesită parola curentă)
  if (enabled === false) {
    if (!currentPassword) return json({ error: 'Current password required' }, 400)
    if (!user?.journalPasswordHash) return json({ error: 'No password set' }, 400)

    const ok = await bcrypt.compare(String(currentPassword), user.journalPasswordHash)
    if (!ok) return json({ error: 'Invalid current password' }, 401)

    const res = json({ ok: true })
    await prisma.user.update({
      where: { id: session.user.id },
      data: { journalLockEnabled: false, journalPasswordHash: null, journalLockHint: '' },
    })
    // opțional: curăță cookie-ul de unlock
    res.cookies.set('journal-unlocked', '', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    })
    return res
  }

  return json({ error: 'Bad request' }, 400)
}
