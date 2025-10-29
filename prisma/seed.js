// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Keep the seed self-contained to avoid ESM issues.
// Make sure this list matches src/domain/badges/catalog.js
const badgeCatalog = [
  { code: 'first_entry', label: 'First Entry', emoji: '✍️', color: 'yellow', tier: 'common', scope: 'journal', description: 'Your very first journal entry.' },
  { code: 'entries_30', label: '30 Entries', emoji: '🧱', color: 'blue', tier: 'common', scope: 'journal', description: 'You have written 30 journal entries.' },
  { code: 'streak_7', label: '7-Day Gentle Streak', emoji: '🔁', color: 'purple', tier: 'rare', scope: 'journal', description: 'You wrote on 7 days in a row. Gentle streaks — you can always start again.' },
  { code: 'all_emotions', label: 'All Emotions Used', emoji: '🧭', color: 'pink', tier: 'epic', scope: 'journal', description: 'You have explored all emotions available in the app.' },
  { code: 'mindful_double_checkin', label: 'Mindful Double Check-In', emoji: '🌿', color: 'yellow', tier: 'rare', scope: 'journal', description: 'You returned to your journal later the same day for a brief, mindful check-in (max twice/day).' },
  { code: 'balanced_week', label: 'Balanced Week', emoji: '⚖️', color: 'blue', tier: 'rare', scope: 'journal', description: 'You journaled on at least 3 different days within a week.' },
  { code: 'posts_10', label: '10 Posts', emoji: '🎯', color: 'yellow', tier: 'common', scope: 'feed', description: 'You have published 10 posts.' },
  { code: 'reactions_10', label: 'Kind Reactions ×10', emoji: '🤝', color: 'blue', tier: 'common', scope: 'feed', description: 'You have given 10 supportive reactions.' },
]

async function main() {
  for (const b of badgeCatalog) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: {
        label: b.label,
        emoji: b.emoji,
        color: b.color,
        tier: b.tier,
        scope: b.scope,
        description: b.description,
      },
      create: b,
    })
  }
}

main()
  .then(async () => {
    console.log('Seeded badges ✅')
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
