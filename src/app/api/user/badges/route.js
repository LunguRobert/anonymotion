// src/app/api/user/badges/route.js
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'

// ----- helpers -----
function toISODate(d) {
  return new Date(d).toISOString().slice(0, 10)
}
function dayMs(tsISO) {
  const [y, m, d] = tsISO.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}
function hasBalancedWeek(uniqueDays) {
  if (!uniqueDays || uniqueDays.length < 3) return false
  const days = uniqueDays.map(dayMs)
  let i = 0
  for (let j = 0; j < days.length; j++) {
    while (days[j] - days[i] > 6 * 24 * 60 * 60 * 1000) i++
    if (j - i + 1 >= 3) return true
  }
  return false
}

// criteria + catalog (importăm din codul tău)
import { badgeCatalog } from '@/lib/catalog'

function evaluateBadges(metrics, scope = 'all') {
  const pool = scope === 'all' ? badgeCatalog : badgeCatalog.filter(b => b.scope === scope)
  const earned = []
  const notEarned = []

  const tierRank = { epic: 0, rare: 1, common: 2 }

  for (const def of pool) {
    const ok = criteriaFor(def.code, metrics)
    const item = { ...def, earned: !!ok }
    ;(ok ? earned : notEarned).push(item)
  }
  const top3 = earned.slice().sort((a, b) => tierRank[a.tier] - tierRank[b.tier]).slice(0, 3)
  return { earned, notEarned, top3 }
}

function criteriaFor(code, m) {
  switch (code) {
    case 'first_entry': return m.journalCount >= 1
    case 'entries_30': return m.journalCount >= 30
    case 'streak_7': return m.maxStreak >= 7
    case 'all_emotions':
      return m.allEmotions.length > 0 &&
             m.usedEmotions &&
             m.allEmotions.every(e => m.usedEmotions.has(e))
    case 'mindful_double_checkin':
      return Object.values(m.entriesPerDay || {}).some(cnt => cnt === 2)
    case 'balanced_week':
      return hasBalancedWeek(m.uniqueDays)
    case 'posts_10': return m.feedPostCount >= 10
    case 'reactions_10': return m.reactionCount >= 10
    default: return false
  }
}

async function safeCount(cb) {
  try { return await cb() } catch (e) {
    // Dacă modelul nu există sau interogarea e invalidă => 0
    if (e?.name?.includes('PrismaClient') || e?.code?.startsWith?.('P')) return 0
    throw e
  }
}

async function fetchJournalEntries(userId) {
  // Încercăm cu emotion; dacă schema nu are coloana, reluăm fără.
  try {
    return await prisma.journalEntry.findMany({
      where: { userId },
      select: { createdAt: true, emotion: true },
      orderBy: { createdAt: 'asc' },
    })
  } catch (_) {
    const rows = await prisma.journalEntry.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
    // atașăm emotion: null (nu stricăm restul logicii)
    return rows.map(r => ({ ...r, emotion: null }))
  }
}

async function persistNewlyEarned(userId, earnedCodes) {
  if (!earnedCodes.length) return []
  const existing = await prisma.userBadge.findMany({
    where: { userId, badgeCode: { in: earnedCodes } },
    select: { badgeCode: true },
  })
  const have = new Set(existing.map(e => e.badgeCode))
  const toInsert = earnedCodes.filter(code => !have.has(code))
  if (!toInsert.length) return []
  await prisma.$transaction(
    toInsert.map(code => prisma.userBadge.create({ data: { userId, badgeCode: code } }))
  )
  return toInsert
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    const scope = searchParams.get('scope') || 'all'

    // 1) date de jurnal (rezilient)
    const journalEntries = await fetchJournalEntries(userId)
    const journalCount = journalEntries.length

    const uniqueDays = [...new Set(journalEntries.map(e => toISODate(e.createdAt)))].sort()
    const entriesPerDay = {}
    for (const e of journalEntries) {
      const k = toISODate(e.createdAt)
      entriesPerDay[k] = (entriesPerDay[k] || 0) + 1
    }

    // streak
    let maxStreak = 0, cur = 0, prev = null
    for (const d of uniqueDays) {
      const ts = dayMs(d)
      if (prev !== null && ts - prev === 24 * 60 * 60 * 1000) cur += 1
      else cur = 1
      maxStreak = Math.max(maxStreak, cur)
      prev = ts
    }

    // emoții (dacă nu există enumul, rămâne [])
    const usedEmotions = new Set(journalEntries.map(e => e.emotion).filter(Boolean))
    let allEmotions = []
    try {
      const client = await import('@prisma/client')
      if (client?.Prisma?.Emotion) allEmotions = Object.values(client.Prisma.Emotion)
    } catch { allEmotions = [] }

    // 2) feed (rezilient la lipsa modelelor)
    const feedPostCount = await safeCount(() => prisma.post.count({ where: { userId } }))
    const reactionCount = await safeCount(() => prisma.reaction.count({ where: { userId } }))

    const metrics = {
      journalCount, uniqueDays, entriesPerDay, maxStreak,
      usedEmotions, allEmotions,
      feedPostCount, reactionCount,
    }

    const { earned, notEarned, top3 } = evaluateBadges(metrics, scope)
    const newlyEarned = await persistNewlyEarned(userId, earned.map(b => b.code))

    return Response.json({ top3, badges: [...earned, ...notEarned], newlyEarned })
  } catch (e) {
    // În dev, întoarcem detalii pentru debugging
    console.error('GET /api/user/badges failed:', e)
    const payload = { error: 'Internal Server Error' }
    if (process.env.NODE_ENV !== 'production') {
      payload.debug = {
        name: e?.name,
        code: e?.code,
        message: e?.message,
        stack: e?.stack?.split('\n').slice(0, 4).join('\n'),
      }
    }
    return Response.json(payload, { status: 500 })
  }
}
