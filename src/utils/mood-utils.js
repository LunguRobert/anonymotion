export function getMoodStyles(mood) {
  const moods = {
    HAPPY: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-400',
      seal: '/seals/seal_happy.webp',
    },
    SAD: {
      bg: 'bg-blue-100',
      border: 'border-blue-400',
      seal: '/seals/seal_sad.webp',
    },
    ANGRY: {
      bg: 'bg-red-100',
      border: 'border-red-400',
      seal: '/seals/seal_angry.webp',
    },
    ANXIOUS: {
      bg: 'bg-purple-100',
      border: 'border-purple-400',
      seal: '/seals/seal_anxious.webp',
    },
    NEUTRAL: {
      bg: 'bg-gray-100',
      border: 'border-gray-400',
      seal: '/seals/seal_neutral.webp',
    },
    NONE: {
      bg: 'bg-gray-100',
      border: 'border-gray-400',
      seal: '/seals/seal_none.webp',
    },
  }

  return moods[mood] || moods['NONE']
}
