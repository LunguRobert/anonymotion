import { badgeCatalog } from './catalog'

/**
 * Compute earned/notEarned from metrics and catalog.
 * Returns { earned, notEarned, top3 }
 */
export function evaluateBadges(metrics, scope = 'all') {
  const pool = scope === 'all'
    ? badgeCatalog
    : badgeCatalog.filter(b => b.scope === scope)

  const earned = []
  const notEarned = []

  for (const def of pool) {
    const ok = criteriaFor(def.code, metrics)
    const item = {
      code: def.code,
      label: def.label,
      emoji: def.emoji,
      color: def.color,
      tier: def.tier,
      scope: def.scope,
      description: def.description,
      earned: !!ok,
    }
    ;(ok ? earned : notEarned).push(item)
  }

  // Heuristic for top3: prioritize rarer tiers, then catalog order.
  const tierRank = { epic: 0, rare: 1, common: 2 }
  const top3 = earned
    .slice()
    .sort((a, b) => (tierRank[a.tier] - tierRank[b.tier]))
    .slice(0, 3)

  return { earned, notEarned, top3 }
}

/**
 * Single source of criteria per badge code.
 * Keep these definitions minimal & gentle (mindfulness-friendly).
 */
function criteriaFor(code, m) {
  switch (code) {
    case 'first_entry':
      return m.journalCount >= 1

    case 'entries_30':
      return m.journalCount >= 30

    case 'streak_7':
      return m.maxStreak >= 7

    case 'all_emotions':
      // all emotions used at least once
      if (!m.allEmotions || !m.usedEmotions) return false
      return m.allEmotions.every(e => m.usedEmotions.has(e))

    case 'mindful_double_checkin':
      // at least one day with EXACTLY two entries (encourages a gentle return, not spamming)
      return Object.values(m.entriesPerDay || {}).some(cnt => cnt === 2)

    case 'balanced_week':
      // at least 3 different days with entries within ANY rolling 7-day window
      return hasBalancedWeek(m.uniqueDays)

    case 'posts_10':
      return m.feedPostCount >= 10

    case 'reactions_10':
      return m.reactionCount >= 10

    default:
      return false
  }
}

function hasBalancedWeek(uniqueDays) {
  if (!uniqueDays || uniqueDays.length < 3) return false
  const toDate = d => new Date(d + 'T00:00:00Z').getTime()
  const days = uniqueDays.map(toDate)
  let i = 0
  for (let j = 0; j < days.length; j++) {
    // shrink window to 7*24h
    while (days[j] - days[i] > 6 * 24 * 60 * 60 * 1000) i++
    const windowCount = j - i + 1
    if (windowCount >= 3) return true
  }
  return false
}
