import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/authOptions'
import { cookies } from 'next/headers'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { password } = await req.json()
  if (!password) return NextResponse.json({ error: 'Missing password' }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { journalLockEnabled: true, journalPasswordHash: true },
  })
  if (!user?.journalLockEnabled || !user.journalPasswordHash) {
    return NextResponse.json({ error: 'Lock not enabled' }, { status: 400 })
  }

  const ok = await bcrypt.compare(String(password), user.journalPasswordHash)
  if (!ok) return NextResponse.json({ error: 'Invalid password' }, { status: 401 })

  const res = NextResponse.json({ ok: true })
  res.cookies.set('journal-unlocked', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 6, // 6h
    path: '/',
  })
  return res
}

export async function DELETE() {
  const c = await cookies()

  // Șterge cookie-ul indiferent dacă există sau nu (idempotent)
  // Folosește aceleași opțiuni ca la setarea cookie-ului inițial!
  c.set('journal-unlocked', '', {
    path: '/',          // la fel ca la set
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,          // ștergere
  })

  return new Response(null, { status: 204 })
}
