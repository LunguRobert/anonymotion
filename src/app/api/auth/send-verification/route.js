// app/api/auth/send-verification/route.js
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions' // adjust path if needed
import prisma from '@/lib/prisma'
import { createEmailVerifyToken, sendVerificationEmail } from '@/lib/emailVerification'
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req) {
  const limited = await enforceRateLimit(req, "login");
  if (limited) return limited;

  const session = await getServerSession(authOptions)

  let body = null
  try { body = await req.json() } catch { /* noop */ }

  // dacă userul e logat, folosim emailul din sesiune; altfel încercăm din body
  const bodyEmail = body?.email ? String(body.email).trim().toLowerCase() : null
  const email = (session?.user?.email?.toLowerCase?.()) || bodyEmail

  if (!email) {
    // e mai util pentru UX să cerem email când nu există sesiune
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.emailVerified) {
    // nu dezvăluim dacă nu există user sau e deja verificat
    return NextResponse.json({ ok: true })
  }

  // Optional, simple rate-limit: if there is a non-expired token, do not create a new one
  const existing = await prisma.verificationToken.findFirst({
    where: { identifier: email, expires: { gt: new Date() } }
  })

  if (existing) {
    // retrimitem linkul existent, nu creăm token nou (evităm flood)
    const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || ''
    const verifyUrl = `${base}/api/auth/verify?token=${encodeURIComponent(existing.token)}`
    await sendVerificationEmail(email, verifyUrl)
    return NextResponse.json({ ok: true })
  }

  const { verifyUrl } = await createEmailVerifyToken(email)
  await sendVerificationEmail(email, verifyUrl)


  return NextResponse.json({ ok: true })
}
