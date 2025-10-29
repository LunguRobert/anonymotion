// app/user/constellation/page.jsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import MindConstellation from '@/components/gamify/MindConstellation'
import ConstellationActions from '@/components/gamify/ConstellationActions'

export default async function ConstellationPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-center text-white/80">You must be signed in.</p>
      </main>
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })
  const isPremium = user?.plan === 'PREMIUM';

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Mind Constellation</h1>
          <p className="mt-1 text-sm text-white/60">
            Stars from your journal entries. Colored rings by mood. Lines connect streak days.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/user/stats"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
          >
            Back to stats
          </Link>
        </div>
      </header>
        {isPremium && (
                <ConstellationActions
                targetSelector="#constellation-root canvas"
                logoSrc="/icon-transparent.png"
                appName="Anonymous Mind"
              />
        )}
      {/* Gating */}
      {!isPremium ? (
        <section className="rounded-3xl border border-secondary bg-surface p-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm text-white/85">
              This visualization is part of <span className="font-semibold">Premium</span>.
            </p>
            <p className="mt-2 text-sm text-white/70">
              See a generative star map of your last month: every entry becomes a star, mood rings add structure,
              and streak lines reveal continuity.
            </p>
            <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row mb-6">
              <Link
                href="/pricing"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-pink-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-pink-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/60"
              >
                Go Premium
              </Link>
              <Link
                href="/user/stats"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                Back to stats
              </Link>
            </div>
          </div>

          {/* Info blocks pentru a explica ce obții (utile și ca pre-marketing) */}
          <InfoBlocks />
        </section>
      ) : (
        <>
          {/* Vizualizarea completă */}
          <section id="constellation-root" className="mb-8">
            <MindConstellation
              logoSrc="/icon-transparent.png"              // sau /logo.png
              watermarkText="Anonymous Mind"   // fallback dacă nu se încarcă logo-ul
              quote="The sky is not the limit; your mind is."
              quoteAuthor="— someone kind"
              logoScale={1.8}
            />
          </section>
          {/* Secțiune informativă: How it works / Why it helps / Tips */}
          <InfoBlocks />
        </>
      )}
    </main>
  )
}

/* ===== Info blocks: explicații + beneficii (conținutul e în EN, cum ai cerut) ===== */
function InfoBlocks() {
  return (
    <section className="rounded-3xl border border-secondary bg-surface p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* How it works */}
        <div className="rounded-2xl border border-white/10 bg-card/70 p-4">
          <h3 className="text-base font-semibold text-white">How it works</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-white/80">
            <li>Every journal entry becomes a <span className="font-medium">star</span> placed on a mood ring.</li>
            <li>Rings are <span className="font-medium">color-coded</span> (Happy, Neutral, Sad, Angry, Anxious).</li>
            <li><span className="font-medium">Streak lines</span> connect consecutive days with entries.</li>
            <li>Refresh after a new entry to <span className="font-medium">regenerate</span> the constellation.</li>
          </ul>
        </div>

        {/* Why it helps */}
        <div className="rounded-2xl border border-white/10 bg-card/70 p-4">
          <h3 className="text-base font-semibold text-white">Why it helps</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-white/80">
            <li>Turns your month into a <span className="font-medium">memorable visual</span> snapshot.</li>
            <li>Highlights <span className="font-medium">streaks</span> and <span className="font-medium">shifts</span> in emotions.</li>
            <li>Encourages consistency without pressure—just a gentle, <span className="font-medium">beautiful nudge</span>.</li>
            <li>Great to save or share as a <span className="font-medium">motivational wallpaper</span>.</li>
          </ul>
        </div>

        {/* Tips & Privacy */}
        <div className="rounded-2xl border border-white/10 bg-card/70 p-4">
          <h3 className="text-base font-semibold text-white">Tips & Privacy</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-white/80">
            <li>For a sharper image, export after opening on a <span className="font-medium">larger screen</span>.</li>
            <li>Try to post across different moods—variety creates <span className="font-medium">richer patterns</span>.</li>
            <li>Your raw entries never leave your account; the image is <span className="font-medium">generated locally</span>.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
