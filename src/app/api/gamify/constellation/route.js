// app/api/gamify/constellation/route.js
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'

// --- utils ---
function hash32(str) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return h >>> 0
}
function prng(seed) {
  let t = seed >>> 0
  return () => {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate() }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }

const MOOD_COLORS = {
  HAPPY:   '#facc15',
  NEUTRAL: '#a3a3a3',
  SAD:     '#60a5fa',
  ANGRY:   '#f87171',
  ANXIOUS: '#c084fc',
  NONE:    '#9ca3af',
}

// Ordinea de la exterior spre interior
const RING_ORDER = ['HAPPY', 'NEUTRAL', 'SAD', 'ANGRY', 'ANXIOUS']

const SUPPORTIVE = new Set(['support','supportive','hug','empathy','imhere','understand'])

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = session.user.id

    const { searchParams } = new URL(req.url)
    const mode = (searchParams.get('mode') || 'month').toLowerCase() // month | rolling30 | all
    const monthQ = searchParams.get('month') // YYYY-MM
    const layout = (searchParams.get('layout') || 'rings').toLowerCase() // default = rings

    // ---- fereastra de timp ----
    const now = new Date()
    let start, end, key, totalSlots
    if (mode === 'rolling30') {
      end = now
      start = new Date(now.getTime() - 29 * 86400000)
      key = 'rolling30'
      totalSlots = 30
    } else if (mode === 'all') {
      const first = await prisma.journalEntry.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true }
      })
      start = first?.createdAt || new Date(now.getTime() - 180 * 86400000)
      end = now
      key = 'all'
      totalSlots = null // vom folosi ordinea
    } else {
      const ref = monthQ ? new Date(`${monthQ}-01T00:00:00Z`) : now
      const y = ref.getUTCFullYear(), m = ref.getUTCMonth()
      start = new Date(Date.UTC(y, m, 1, 0, 0, 0))
      end   = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59))
      key = `${y}-${String(m+1).padStart(2,'0')}`
      totalSlots = daysInMonth(y, m)
    }

    // ---- date ----
    const entries = await prisma.journalEntry.findMany({
      where: { userId, createdAt: { gte: start, lte: end } },
      select: { id: true, mood: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const posts = await prisma.post.findMany({
      where: { userId, createdAt: { gte: start, lte: end } },
      select: { reactions: { select: { type: true } } },
    })
    let supportScore = 0
    for (const p of posts) for (const r of (p.reactions || [])) if (SUPPORTIVE.has(r.type)) supportScore++

    // ---- seed ----
    const seed = hash32(`${userId}|${key}|${layout}`)
    const rnd = prng(seed)

    // ---- ring geometry (viewBox 100 x 100) ----
    // centrul cosmic :)
    const cx = 50, cy = 50
    // raze majore pentru elipse (exterioară → interioară)
    const RX = [42, 34, 27, 20, 14]
    const RY_RATIO = 0.68 // elipticitate
    const ringByMood = Object.fromEntries(RING_ORDER.map((m, i) => [m, { rx: RX[i], ry: RX[i] * RY_RATIO }]))
    const fallbackRing = { rx: 10, ry: 10 * RY_RATIO }

    // ---- plasare stele pe elipse ----
    const stars = []
    const counts = { HAPPY:0, NEUTRAL:0, SAD:0, ANGRY:0, ANXIOUS:0, NONE:0 }

    // pentru „month”, grupăm pe zile ca să distribuim unghiurile coerent
    const perDayCounter = new Map()

    entries.forEach((e, idx) => {
      const mood = RING_ORDER.includes(e.mood) ? e.mood : 'NONE'
      counts[mood]++

      let slot, jitterSeed
      const d = new Date(e.createdAt)
      if (mode === 'month') {
        const day = d.getUTCDate()
        const dupIdx = perDayCounter.get(day) ?? 0
        perDayCounter.set(day, dupIdx + 1)
        slot = (day - 1 + dupIdx * 0.12) / totalSlots // în jurul zilei curente, mic offset pt. multiple intrări
        jitterSeed = `${e.id}|${day}`
      } else if (mode === 'rolling30') {
        // distribuim uniform după index
        slot = idx / Math.max(1, entries.length)
        jitterSeed = `${e.id}|r30`
      } else { // all
        slot = idx / Math.max(1, entries.length)
        jitterSeed = `${e.id}|all`
      }

      const j = prng(hash32(`${jitterSeed}|${seed}`))
      const angle = 2 * Math.PI * slot + (j() * 0.35 - 0.175) // ușor jitter
      const ring = ringByMood[mood] || fallbackRing
      const rx = ring.rx * (0.98 + j()*0.04) // mică respirație
      const ry = ring.ry * (0.98 + j()*0.04)

      const x = cx + Math.cos(angle) * rx
      const y = cy + Math.sin(angle) * ry

      const rCore = 0.7 + j()*1.4
      const baseGlow = mood === 'HAPPY' ? 1.0 : mood === 'NEUTRAL' ? 0.85 : 0.65
      const glow = clamp(baseGlow + Math.min(0.45, supportScore / 120), 0.6, 1.2)

      stars.push({ x, y, r: rCore, glow, mood, ts: e.createdAt })
    })

    // predominant mood
    const predominantMood = Object.entries(counts)
      .filter(([m]) => m !== 'NONE')
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'NEUTRAL'

    const score = Math.round(stars.reduce((s, st) => s + st.glow * 10, 0) + supportScore)

    return Response.json({
      mode,
      key,
      layout: 'rings',
      colors: MOOD_COLORS,
      rings: ringByMood,
      stars,
      meta: {
        counts,
        supportScore,
        score,
        predominantMood,
        seed, // pentru starfield client-side
      },
    })
  } catch (e) {
    console.error('GET /api/gamify/constellation', e)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
