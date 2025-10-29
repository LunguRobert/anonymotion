export const BadgeTier = { common: 'common', rare: 'rare', epic: 'epic' }
export const BadgeScope = { journal: 'journal', feed: 'feed' }

/**
 * Source of truth for badges shown in the app.
 * Text is in ENGLISH (UI content).
 */
export const badgeCatalog = [
  // Journal-focused
  {
    code: 'first_entry',
    label: 'First Entry',
    emoji: '✍️',
    color: 'yellow',
    tier: BadgeTier.common,
    scope: BadgeScope.journal,
    description: 'Your very first journal entry.',
  },
  {
    code: 'entries_30',
    label: '30 Entries',
    emoji: '🧱',
    color: 'blue',
    tier: BadgeTier.common,
    scope: BadgeScope.journal,
    description: 'You have written 30 journal entries.',
  },
  {
    code: 'streak_7',
    label: '7-Day Gentle Streak',
    emoji: '🔁',
    color: 'purple',
    tier: BadgeTier.rare,
    scope: BadgeScope.journal,
    description:
      'You wrote on 7 days in a row. Gentle streaks — you can always start again.',
  },
  {
    code: 'all_emotions',
    label: 'All Emotions Used',
    emoji: '🧭',
    color: 'pink',
    tier: BadgeTier.epic,
    scope: BadgeScope.journal,
    description:
      'You have explored all emotions available in the app.',
  },

  // Healthier alternative to “Most active day”
  {
    code: 'mindful_double_checkin',
    label: 'Mindful Double Check-In',
    emoji: '🌿',
    color: 'yellow',
    tier: BadgeTier.rare,
    scope: BadgeScope.journal,
    description:
      'You returned to your journal later the same day for a brief, mindful check-in (max twice/day).',
  },

  // Balance across days
  {
    code: 'balanced_week',
    label: 'Balanced Week',
    emoji: '⚖️',
    color: 'blue',
    tier: BadgeTier.rare,
    scope: BadgeScope.journal,
    description:
      'You journaled on at least 3 different days within a week.',
  },

  // Social/feed (keep only if you have a social area)
  {
    code: 'posts_10',
    label: '10 Posts',
    emoji: '🎯',
    color: 'yellow',
    tier: BadgeTier.common,
    scope: BadgeScope.feed,
    description: 'You have published 10 posts.',
  },
  {
    code: 'reactions_10',
    label: 'Kind Reactions ×10',
    emoji: '🤝',
    color: 'blue',
    tier: BadgeTier.common,
    scope: BadgeScope.feed,
    description: 'You have given 10 supportive reactions.',
  },
]
