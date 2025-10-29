export const runtime = 'nodejs'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const userId = session.user.id

  // Postări + count de reacții date
  const [posts, reactionCount] = await Promise.all([
    prisma.post.findMany({
      where: { userId },
      select: {
        id: true,
        content: true,
        emotion: true,
        createdAt: true,
        reactions: {
          select: { type: true }
        },
      },
    }),
    prisma.reaction.count({ where: { userId } }),
  ])

  const postCount = posts.length

  // Active days (distinct by day string)
  const activeDaysSet = new Set(
    posts.map(p => new Date(p.createdAt).toISOString().split('T')[0])
  )
  const activeDays = activeDaysSet.size

  // Most used emotion
  const emotionCount = {}
  for (const post of posts) {
    emotionCount[post.emotion] = (emotionCount[post.emotion] || 0) + 1
  }
  const mostUsedEmotion = Object.entries(emotionCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null

  // Distribution for chart
  const emotionDistribution = Object.entries(emotionCount).map(([emotion, count]) => ({
    emotion,
    count,
  }))

  // Last 3 posts (desc by createdAt)
  const lastPosts = posts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
    .map(post => {
      const reactionSummary = post.reactions.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1
        return acc
      }, {})
      return {
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        emotion: post.emotion,
        reactions: reactionSummary
      }
    })

  // BADGES (bazate pe activitate)
  const badges = []
  if (postCount >= 10) badges.push('Posted 10 times')
  if (postCount >= 25) badges.push('Posted 25 times')
  if (reactionCount >= 5) badges.push('Reacted to 5 posts')
  if (reactionCount >= 10) badges.push('Reacted to 10 posts')
  if (activeDays >= 3) badges.push('3 posts in 3 different days')

  return Response.json({
    postCount,
    activeDays,
    mostUsedEmotion,
    emotionDistribution,
    lastPosts,
    badges,
  })
}
