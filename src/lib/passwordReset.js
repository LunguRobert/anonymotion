// src/lib/passwordReset.js
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import prisma from '@/lib/prisma'

const EXP_MIN = Number(process.env.PASSWORD_RESET_EXPIRES_MIN || process.env.EMAIL_VERIFY_EXPIRES_MIN || 30)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export async function createPasswordResetToken(email) {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + EXP_MIN * 60 * 1000)

  // keep a single active token per email
  await prisma.passwordResetToken.deleteMany({ where: { identifier: email } })
  await prisma.passwordResetToken.create({
    data: { identifier: email, token, expires },
  })

  const resetUrl = `${BASE_URL}/auth/reset?token=${token}`
  return { token, resetUrl, expires }
}

async function getTransporter() {
  const URI = process.env.EMAIL_SERVER
  const host = process.env.EMAIL_SERVER_HOST
  const port = Number(process.env.EMAIL_SERVER_PORT || 0)
  const user = process.env.EMAIL_SERVER_USER
  const pass = process.env.EMAIL_SERVER_PASSWORD

  // 1) Single URI (NextAuth style), e.g.:
  //    smtp://USER:PASS@smtp.yourhost.com:587   (STARTTLS)
  //    smtps://USER:PASS@smtp.yourhost.com:465  (implicit TLS)
  if (URI) {
    return nodemailer.createTransport(URI)
  }

  // 2) Separate vars
  if (host && user && pass && port) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // implicit TLS for 465
      auth: { user, pass },
    })
  }

  // 3) Dev fallback (Ethereal) so local dev doesn't crash if env is missing
  if (process.env.NODE_ENV !== 'production') {
    const test = await nodemailer.createTestAccount()
    return nodemailer.createTransport({
      host: test.smtp.host,
      port: test.smtp.port,
      secure: test.smtp.secure,
      auth: { user: test.user, pass: test.pass },
    })
  }

  throw new Error('Email transport is not configured. Set EMAIL_SERVER or EMAIL_SERVER_HOST/PORT/USER/PASSWORD.')
}

export async function sendPasswordResetEmail(to, resetUrl) {
  const transporter = await getTransporter()

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #0b0f14; padding: 8px">
      <h2 style="margin: 0 0 12px; color: #121825;">Reset your password</h2>
      <p style="margin: 0 0 12px;">Click the button below to set a new password. This link expires in ${EXP_MIN} minutes.</p>
      <p style="margin: 16px 0;">
        <a href="${resetUrl}"
           style="display:inline-block; padding:10px 16px; border-radius:10px; background:#6d28d9; color:#f1f5f9; text-decoration:none; font-weight:600">
           Reset password
        </a>
      </p>
      <p style="margin: 12px 0;">Or copy this link into your browser:<br><a href="${resetUrl}" style="color:#6d28d9;">${resetUrl}</a></p>
      <p style="margin: 12px 0; color:#94a3b8;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@localhost',
    to,
    subject: 'Reset your password',
    html,
    text: `Reset your password\n\nOpen this link (expires in ${EXP_MIN} minutes):\n${resetUrl}\n\nIf you didn’t request this, you can ignore this message.`,
  })

  // Helpful in dev when using Ethereal fallback
  if (process.env.NODE_ENV !== 'production' && nodemailer.getTestMessageUrl) {
    const preview = nodemailer.getTestMessageUrl(info)
    if (preview) console.log('🔗 Ethereal preview:', preview)
  }
}
