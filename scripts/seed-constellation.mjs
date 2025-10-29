// scripts/seed-constellation.mjs
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

/**
 * USAGE:
 *   node scripts/seed-constellation.mjs 2025-09 USER_ID
 *   node scripts/seed-constellation.mjs last30 USER_ID
 *
 * Se scrie în modelul JournalEntry cu câmpul obligatoriu: mood
 */

const EMOTIONS = ['HAPPY', 'SAD', 'ANGRY', 'ANXIOUS', 'NEUTRAL']
const pickEmotion = (i) => EMOTIONS[i % EMOTIONS.length]
const daysInMonth = (y, m0) => new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate()
const atNoonUTC = (y, m0, d) => new Date(Date.UTC(y, m0, d, 12, 0, 0))

function makeContent(d, emo) {
  return `Backfilled entry for ${d.toISOString().slice(0,10)}. Mood: ${emo}.`
}

function parseMonthArg(arg) {
  if (!arg || arg === 'last30') return { mode: 'last30' }
  const m = /^(\d{4})-(\d{2})$/.exec(arg)
  if (!m) throw new Error(`Month must be 'YYYY-MM' or 'last30'. Received: ${arg}`)
  const year = Number(m[1]); const monthIndex0 = Number(m[2]) - 1
  if (monthIndex0 < 0 || monthIndex0 > 11) throw new Error('Invalid month index.')
  return { mode: 'month', year, monthIndex0 }
}

function maskDbUrl(url = '') {
  if (!url) return '(not set)'
  try {
    const u = new URL(url)
    const maskedUser = u.username ? `${u.username.slice(0,2)}***` : ''
    return `${u.protocol}//${maskedUser}${maskedUser?'@':''}${u.host}${u.pathname}`
  } catch { return '(unparsable)' }
}

async function main() {
  const [,, monthArg = 'last30', userIdCLI] = process.argv
  const USER_ID = userIdCLI || process.env.SEED_USER_ID
  if (!USER_ID) throw new Error('Please pass USER_ID (arg #2) or set SEED_USER_ID in .env/.env.local')

  console.log('DATABASE_URL:', maskDbUrl(process.env.DATABASE_URL))
  console.log('NODE_ENV:', process.env.NODE_ENV || '(not set)')

  const parsed = parseMonthArg(monthArg)
  const entries = []

  if (parsed.mode === 'last30') {
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i, 12, 0, 0))
      entries.push({ d, emo: pickEmotion(29 - i) })
    }
  } else {
    const { year, monthIndex0 } = parsed
    const n = daysInMonth(year, monthIndex0)
    for (let day = 1; day <= n && entries.length < 30; day++) {
      entries.push({ d: atNoonUTC(year, monthIndex0, day), emo: pickEmotion(day - 1) })
    }
  }

  if (!entries.length) { console.log('Nothing to insert. Exit.'); return }

  const minDate = entries[0].d
  const maxDate = entries[entries.length - 1].d
  console.log('Target user:', USER_ID)
  console.log(`Range: ${minDate.toISOString()} → ${maxDate.toISOString()}`)
  console.log(`Planned inserts: ${entries.length}`)
  console.table(entries.slice(0,3).map(p => ({ date: p.d.toISOString().slice(0,10), mood: p.emo })))

  // TRIM: șterge doar intrările din intervalul țintă
  const result = await prisma.$transaction(async (tx) => {
    const del = await tx.journalEntry.deleteMany({
      where: { userId: USER_ID, createdAt: { gte: minDate, lte: maxDate } }
    })

    const data = entries.map(({ d, emo }) => ({
      userId: USER_ID,
      mood: emo,                 // 👈 câmpul corect din schema ta
      content: makeContent(d, emo),
      createdAt: d,
      // dacă ai câmpuri obligatorii, adaugă-le aici:
      // tenantId: '...', visibility: 'PRIVATE' | 'PUBLIC', etc.
    }))

    const ins = await tx.journalEntry.createMany({ data })
    return { delCount: del.count, insCount: ins.count }
  })

  console.log(`Deleted in range: ${result.delCount}`)
  console.log(`Inserted: ${result.insCount}`)

  // Verificare lejeră (fără câmpuri sensibile)
  const verify = await prisma.journalEntry.findMany({
    where: { userId: USER_ID, createdAt: { gte: minDate, lte: maxDate } },
    select: { id: true, createdAt: true },   // nu selectăm un câmp care ar putea lipsi
    orderBy: { createdAt: 'asc' },
    take: 3,
  })
  console.log(`Found after insert (first 3):`)
  console.table(verify.map(x => ({ id: x.id, createdAt: x.createdAt.toISOString() })))

  console.log('Done. Constellation populated ✅')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
