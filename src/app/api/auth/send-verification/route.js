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
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (user?.emailVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true })
  }

  // Optional, simple rate-limit: if there is a non-expired token, do not create a new one
  const existing = await prisma.verificationToken.findFirst({
    where: { identifier: email, expires: { gt: new Date() } }
  })
  if (existing) {
    return NextResponse.json({ error: 'Please wait before requesting another verification email.' }, { status: 429 })
  }

  const { verifyUrl } = await createEmailVerifyToken(email)
  await sendVerificationEmail(email, verifyUrl)

  return NextResponse.json({ ok: true })
}
