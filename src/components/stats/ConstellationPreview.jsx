'use client'

import Link from 'next/link'
import { Sparkles, Stars, RefreshCcw, LineChart } from 'lucide-react'

export default function ConstellationPreview({ isPremium }) {
  // culorile pe care deja le folosești în vizualizare
  const colors = {
    HAPPY:   '#facc15',
    NEUTRAL: '#a3a3a3',
    SAD:     '#60a5fa',
    ANGRY:   '#f87171',
    ANXIOUS: '#c084fc',
  }

  const bullets = [
    {
      icon: <Stars className="h-4 w-4" aria-hidden />,
      title: 'Stars from your entries',
      text:  'Each journal entry becomes a star placed on the mood ring.',
    },
    {
      icon: <LineChart className="h-4 w-4" aria-hidden />,
      title: 'Streak lines',
      text:  'Chronological lines connect days with entries, revealing streaks.',
    },
    {
      icon: <RefreshCcw className="h-4 w-4" aria-hidden />,
      title: 'Always current',
      text:  'After new entries, refresh in the full view to regenerate the map.',
    },
  ]

  return (
    <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-4 sm:p-6">
      <div className="glow-lamp absolute inset-0" />

      {/* décor subtil de „stardust” */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 opacity-70"
        style={{
          background:
            'radial-gradient(1500px 700px at 80% 10%, rgba(109,40,217,.18), transparent 60%), radial-gradient(1000px 600px at 20% 70%, rgba(34,211,238,.10), transparent 60%)',
          maskImage:
            'radial-gradient(80% 80% at 50% 50%, black 70%, transparent 100%)',
        }}
      />

      <div className="relative z-10">
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white">
              Mind Constellation
            </h3>
            <p className="mt-1 text-xs text-white/70">
              A generative star map of your last month: rings by mood, stars for entries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Premium feature</span>
            </div>
          </div>
        </header>

        {/* Legendă compactă (culori = mood rings) */}
        <div className="mb-5 flex flex-wrap items-center gap-3 text-[11px]">
          {Object.entries(colors).map(([mood, col]) => (
            <span key={mood} className="inline-flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-white/30"
                style={{ backgroundColor: col }}
              />
              <span className="text-white/85">
                {mood.charAt(0) + mood.slice(1).toLowerCase()}
              </span>
            </span>
          ))}
        </div>

        {/* Bullets — ce găsești în pagina full */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {bullets.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-white/10 bg-card/70 p-3"
            >
              <div className="mb-1 inline-flex items-center gap-2 text-white">
                <span className="rounded-md bg-white/10 p-1.5">{b.icon}</span>
                <span className="text-sm font-medium">{b.title}</span>
              </div>
              <p className="text-[11px] text-white/70">{b.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="not-prose mt-5 flex w-full flex-col gap-2 sm:flex-row">
          {/* Primary */}
          <Link
            href="/user/constellation"
            className="inline-flex w-full items-center justify-center rounded-full bg-pink-600 px-5 py-2 text-sm font-semibold shadow transition hover:bg-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/60 !text-white hover:!text-white no-underline"
          >
            Open full view
          </Link>

          {/* Secondary */}
          {!isPremium ? (
            <Link
              href="/pricing"
              className="inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold  shadow-sm transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 !text-slate-950 hover:!text-slate-950 no-underline"
            >
              Go Premium
            </Link>
          ) : (
            <span className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white/80">
              Included in your plan
            </span>
          )}
        </div>


      </div>
    </section>
  )
}
