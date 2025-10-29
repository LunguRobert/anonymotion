// lib/emailVerification.js
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import prisma from '@/lib/prisma'

const EXP_MIN = Number(process.env.EMAIL_VERIFY_EXPIRES_MIN || 30)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export async function createEmailVerifyToken(email) {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + EXP_MIN * 60 * 1000)

  // Ensure only one active token per email
  await prisma.verificationToken.deleteMany({ where: { identifier: email } })
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires }
  })

  const verifyUrl = `${BASE_URL}/api/auth/verify?token=${token}`
  return { token, verifyUrl, expires }
}

export async function sendVerificationEmail(to, verifyUrl) {
  const transporter = process.env.EMAIL_SERVER
    ? nodemailer.createTransport(process.env.EMAIL_SERVER)
    : nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT || 587),
        secure: false,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      })

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.5">
      <h2>Email verification</h2>
      <p>Click the button below to verify your email. This link expires in ${EXP_MIN} minutes.</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#111;color:#fff;text-decoration:none">Verify email</a></p>
      <p>Or copy this link into your browser:<br>${verifyUrl}</p>
      <p>If you did not request this, you can safely ignore this message.</p>
    </div>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify your email',
    html,
  })
}
