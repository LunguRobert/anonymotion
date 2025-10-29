// app/api/auth/register/route.js
export const runtime = 'nodejs' // ensure Node.js runtime (randomBytes, nodemailer)

import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { createEmailVerifyToken, sendVerificationEmail } from '@/lib/emailVerification'
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req) {
  const limited = await enforceRateLimit(req, "login");
  if (limited) return limited;

  try {
    const { email, password } = await req.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    // Create user
    const hashed = await hash(password, 10)
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        emailVerified: null
      }
    })

    // Generate verification token + send mail
    const { verifyUrl } = await createEmailVerifyToken(email)
    await sendVerificationEmail(
      email,
      verifyUrl
    )

    return NextResponse.json({ success: true, message: 'Account created. Please check your inbox to verify your email.' })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
