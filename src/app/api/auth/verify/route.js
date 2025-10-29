// app/api/auth/verify/route.js
export const runtime = 'nodejs'

import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(req) {
  const limited = await enforceRateLimit(req, "login");
  if (limited) return limited;

  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/verify?status=missing`)
  }

  // Find token (unique in your schema)
  const rec = await prisma.verificationToken.findUnique({ where: { token } })

  // Invalid or expired
  if (!rec || rec.expires < new Date()) {
    if (rec) {
      try { await prisma.verificationToken.delete({ where: { token } }) } catch {}
    }
    return NextResponse.redirect(`${baseUrl}/verify?status=expired`)
  }

  // Mark user as verified
  await prisma.user.update({
    where: { email: rec.identifier },
    data: { emailVerified: new Date() }
  })

  // Single-use token
  await prisma.verificationToken.delete({ where: { token } })

  return NextResponse.redirect(`${baseUrl}/verify?status=success`)
}
