// components/marketing/MindConstellation.jsx
// Server Component — no "use client"
import Image from 'next/image'
import Link from 'next/link'

export default function MindConstellation() {
  return (
    <section
      id="mind-constellation"
      aria-labelledby="mc-title"
      className="relative overflow-hidden border-t border-white/10 bg-[color-mix(in_lch,var(--color-background),transparent_4%)]"
    >
      {/* subtle glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-fuchsia-500/10 via-cyan-400/10 to-transparent blur-2xl"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 sm:px-[24px] md:grid-cols-2 md:gap-10 py-[64px]">
        {/* TEXT SIDE */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/70">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
            Premium preview
          </span>

          <h2
            id="mc-title"
            className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
          >
            Mind Constellation
          </h2>

          <p className="mt-2 max-w-prose text-sm text-white/70">
            Your private <strong>journal entries</strong> become a galaxy of emotions — not the public feed posts.
            Each reflection turns into a star, grouped by feeling and intensity. Watch how your moods evolve and
            connect over time in a calm, visual way.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-white/85">
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Interactive clusters by emotion (journal-based)
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
              Track mood streaks, volatility, and patterns over months
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
              Shareable visuals, fully private by default
            </li>
          </ul>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full bg-pink-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/60"
            >
              Premium (coming soon)
            </Link>
            <Link
              href="/user/stats"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              See stats preview
            </Link>
          </div>

          <p className="mt-2 text-[11px] text-white/60">
            A 7-day free trial will be available at launch.
          </p>
        </div>

        {/* IMAGE SIDE */}
        <figure className="relative">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <Image
              src="/images/mind-constellation_2.webp"
              alt="Mind Constellation — a galaxy-like map built from your private journal entries."
              width={1600}
              height={900}
              className="h-auto w-full object-cover"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 50vw"
            />
          </div>
          <figcaption className="mt-2 text-center text-[11px] text-white/50">
            Visualization generated from your journal entries (Premium feature)
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
