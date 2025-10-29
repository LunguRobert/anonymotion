// app/user/stats/page.jsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import FeedStats from '@/components/stats/FeedStats'
import JournalStats from '@/components/stats/JournalStats'
import StatsOverview from '@/components/stats/StatsOverview'
import ConstellationPreview from '@/components/stats/ConstellationPreview'

export default async function StatsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return <p className="text-center py-10">You must be signed in to view stats.</p>
  }

  // real plan from DB (Plan enum: FREE | PREMIUM)
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true }
  })
  const isPremium = me?.plan === 'PREMIUM'

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">Your Activity</h1>
        <p className="mt-2 text-sm text-white/60">
          A clear overview of your community and journal insights.
        </p>
      </header>

      <section className="space-y-8 sm:space-y-10">
        <StatsOverview isPremium={isPremium} />
        <FeedStats />
        <ConstellationPreview isPremium={isPremium} />
        <JournalStats isPremium={isPremium} />
      </section>
    </main>
  )
}
