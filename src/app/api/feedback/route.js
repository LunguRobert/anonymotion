// src/app/api/feedback/route.js
export const runtime = 'nodejs' // Prisma nu merge pe edge

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { enforceRateLimit } from '@/lib/rate-limit'

function getClientIp(req) {
  try {
    const fwd = req.headers.get('x-forwarded-for')
    return (fwd?.split(',')[0] || '') || req.headers.get('x-real-ip') || 'unknown'
  } catch { return 'unknown' }
}

function validate(body) {
  const errors = []
  const allowedTypes = ['bug', 'feature', 'praise', 'other']
  if (!body?.message || typeof body.message !== 'string' || body.message.trim().length < 5) {
    errors.push('Message must be at least 5 characters.')
  }
  if (body?.type && !allowedTypes.includes(String(body.type).toLowerCase())) {
    errors.push('Invalid feedback type.')
  }
  if (body?.rating != null) {
    const r = Number(body.rating)
    if (!Number.isFinite(r) || r < 1 || r > 5) errors.push('Rating must be 1–5.')
  }
  if (body?.email && typeof body.email === 'string') {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
    if (!ok) errors.push('Email is invalid.')
  }
  return errors
}

function toPrismaType(t) {
  const m = String(t || 'other').toLowerCase()
  if (m === 'bug') return 'BUG'
  if (m === 'feature') return 'FEATURE'
  if (m === 'praise') return 'PRAISE'
  return 'OTHER'
}

export async function POST(req) {
  // 1) rate-limit (3/min/IP – definit în rate-limit.js ca feedback1m)
    const limited = (await enforceRateLimit(req, 'feedback1m')) ?? { success: true }
    if (limited?.success === false) {
    return NextResponse.json(
      { error: 'Too many feedback submissions. Please try again in a minute.' },
      { status: 429 }
    )
  }

  // 2) parse & validate
  let body
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }
  const errors = validate(body)
  if (errors.length) return NextResponse.json({ error: errors.join(' ') }, { status: 400 })

  // 3) build data for DB
  const ip = getClientIp(req)
  const ua = req.headers.get('user-agent') || ''
  const data = {
    type: toPrismaType(body.type),
    rating: body.rating != null ? Number(body.rating) : null,
    message: body.message.trim(),
    email: body.email?.trim() || null,
    from: body.from || 'app',
    ip,
    ua,
    userId: body.userId || null,
  }

  // 4) insert
  try {
    const created = await prisma.feedback.create({ data })
    return NextResponse.json({ ok: true, id: created.id })
  } catch (e) {
    console.error('feedback create error', e)
    return NextResponse.json({ error: 'Could not save feedback.' }, { status: 500 })
  }
}

// Admin/dev: ultimele 200 feedback-uri
export async function GET() {
  try {
    const items = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    return NextResponse.json({ items })
  } catch (e) {
    console.error('feedback list error', e)
    return NextResponse.json({ items: [] })
  }
}
