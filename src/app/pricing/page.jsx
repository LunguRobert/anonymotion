// app/pricing/page.jsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  X,
  Crown,
  Sparkles,
  CreditCard,
  Shield,
  Lock,
  Zap,
  Info,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function PricingPage() {
  // Monthly only; yearly removed
  const [cycle] = useState('monthly')
  const price = { main: 7.99, per: 'month' }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-6 sm:p-10">
        <div className="glow-lamp absolute inset-0" />
        <div className="relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/70">
              <Sparkles className="h-3.5 w-3.5" />
              Unlock calm, clarity, and deeper insights
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Simple pricing for a mindful life
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-white/70">
              Start free today. <strong>Premium</strong> with a <strong>7‑day free trial</strong> is <strong>coming soon</strong> —
              built for deeper insights, private locks, and powerful exports.
            </p>

            {/* Monthly only */}
            <div className="mx-auto mt-6 w-full max-w-md">
              <div className="rounded-2xl border border-white/10 bg-card p-2 text-xs text-white/70">
                Monthly billing • $7.99/month
              </div>
            </div>
          </div>

          {/* Plans */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2">
            <PlanCard
              title="Free"
              subtitle="A calm space to begin."
              price="$0"
              per="forever"
              cta={{ label: 'Start for free', href: '/user', variant: 'primary' }}
              highlights={[
                'Anonymous feed: post & react',
                '“Last post” reminder popup',
                'Unlimited basic journaling',
              ]}
              features={[
                { label: 'Anonymous feed: post, reactions, filters, report', ok: true },
                { label: 'Journal entries (unlimited)', ok: true },
                { label: 'Emotion filters in journal', ok: true },
                { label: 'Stats preview (entries, streak, top emotion)', ok: true },
                { label: 'My Posts (history view)', ok: true },
                { label: 'Advanced stats & heatmaps', ok: false },
                { label: 'Mind Constellation', ok: false },
                { label: 'Export (CSV, PDF)', ok: false },
                { label: 'Advanced search & filters', ok: false },
                { label: 'Journal Lock (PIN / biometric)', ok: false },
                { label: 'Priority support', ok: false },
              ]}
            />

            <PlanCard
              title="Premium"
              subtitle="Deeper insights. Powerful exports."
              price={`$${price.main}`}
              per={price.per}
              badge="Coming soon"
              icon={<Crown className="h-4 w-4" />}
              cta={{
                label: 'Premium (coming soon)',
                href: '#',
                variant: 'premium',
                disabled: true,
              }}
              highlights={[
                'Journal Lock (PIN / biometric)',
                'Advanced stats & monthly heatmap',
                'Mind Constellation (preview below)',
              ]}
              features={[
                { label: 'All Free features', ok: true },
                { label: 'Advanced insights: trends & correlations', ok: true },
                { label: 'Monthly mood heatmap (detailed)', ok: true },
                { label: 'Mind Constellation (full experience)', ok: true },
                { label: 'Export data (CSV, PDF)', ok: true },
                { label: 'Advanced search & combined filters', ok: true },
                { label: 'My Posts: timeline & emotion evolution', ok: true },
                { label: 'Priority support', ok: true },
              ]}
              footNote={'Includes a 7‑day free trial at launch.'}
            >
              {/* Premium preview block */}
              <div className="mt-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-sm text-white/80">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <Zap className="h-3.5 w-3.5 text-emerald-300" />
                      </span>
                      <span>Mind Constellation — preview</span>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70">
                      Coming soon
                    </span>
                  </div>
                  <div className="relative overflow-hidden rounded-xl">
                    <Image
                      src="/images/mind-constellation_2.webp"
                      alt="Mind Constellation preview"
                      width={1600}
                      height={900}
                      className="h-auto w-full object-cover"
                      priority={false}
                    />
                  </div>
                  <p className="mt-2 text-xs text-white/70">
                    Explore your emotions as a galaxy. The full interactive map will be available with Premium at launch.
                  </p>
                </div>
              </div>
            </PlanCard>
          </div>

          {/* Trust strip */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TrustItem
              icon={<Shield className="h-5 w-5" />}
              title="Private & secure"
              text="Your data stays yours. We never sell it."
            />
            <TrustItem
              icon={<Lock className="h-5 w-5" />}
              title="No ads, no tracking"
              text="A calm space by design — distraction-free."
            />
            <TrustItem
              icon={<CreditCard className="h-5 w-5" />}
              title="7‑day free trial"
              text="Try Premium at launch, then $7.99/month."
            />
          </div>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="mt-8 sm:mt-10">
        <Comparison />
      </section>

      {/* FAQ */}
      <section className="mt-8 sm:mt-10">
        <Faq />
      </section>

      {/* Final CTA */}
      <section className="mt-8 sm:mt-12">
        <FinalCta />
      </section>
    </main>
  )
}

/* -------------------- small components -------------------- */

function PlanCard({
  title,
  subtitle,
  price,
  per,
  cta,
  highlights = [],
  features = [],
  badge,
  icon,
  footNote,
  children,
}) {
  const isPremium = title?.toLowerCase() === 'premium'
  return (
    <motion.div
      layout
      className={`relative overflow-hidden rounded-3xl border border-secondary bg-card p-4 sm:p-6 ${
        isPremium ? 'ring-1 ring-white/10' : ''
      }`}
    >
      {/* corner glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-pink-500/15 blur-3xl" />
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            {icon ? <span className="text-yellow-300">{icon}</span> : null}
          </div>
          <p className="mt-1 text-sm text-white/70">{subtitle}</p>
        </div>
        {badge ? (
          <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
            {badge}
          </span>
        ) : null}
      </header>

      <div className="flex items-end gap-2">
        <div className="text-4xl font-semibold text-white tabular-nums">{price}</div>
        <div className="pb-1 text-sm text-white/70">/ {per}</div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {highlights.map((h) => (
          <div key={h} className="inline-flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <Zap className="h-3.5 w-3.5 text-emerald-300" />
            </span>
            <span className="text-sm text-white/90">{h}</span>
          </div>
        ))}
      </div>

      <div className="mt-5">
        {cta?.disabled ? (
          <button
            disabled
            className={`inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold opacity-70 cursor-not-allowed border border-white/15 bg-white/10 text-white/70`}
            aria-disabled="true"
          >
            {cta.label}
          </button>
        ) : (
          <Link
            href={cta.href}
            className={`inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 ${
              cta.variant === 'premium'
                ? 'bg-pink-600 !text-white shadow hover:bg-pink-700 focus-visible:ring-pink-400/60'
                : 'border border-white/15 bg-white !text-slate-900 shadow-sm hover:bg-white/90 focus-visible:ring-white/50'
            }`}
          >
            {cta.label}
          </Link>
        )}
        {footNote ? (
          <p className="mt-2 text-center text-[11px] text-white/60">{footNote}</p>
        ) : null}
      </div>

      <hr className="my-5 border-white/10" />

      <ul className="space-y-2">
        {features.map((f) => (
          <li
            key={f.label}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
          >
            <span className="text-sm text-white/90">{f.label}</span>
            {f.ok ? (
              <Check className="h-5 w-5 text-emerald-300" aria-label="Included" />
            ) : (
              <X className="h-5 w-5 text-white/40" aria-label="Not included" />
            )}
          </li>
        ))}
      </ul>

      {children}
    </motion.div>
  )
}

function TrustItem({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="text-white/90">{icon}</span>
        <h3 className="text-sm font-medium text-white">{title}</h3>
      </div>
      <p className="mt-1 text-xs text-white/70">{text}</p>
    </div>
  )
}

function Comparison() {
  const rows = [
    { feature: 'Anonymous feed: post, reactions, filters, report', free: true, pro: true },
    { feature: '“Last post” reminder popup', free: true, pro: true },
    { feature: 'Basic journaling (unlimited)', free: true, pro: true },
    { feature: 'Stats preview (entries, streak, top emotion)', free: true, pro: true },
    { feature: 'My Posts (basic history view)', free: true, pro: true },
    { feature: 'Journal Lock (PIN / biometric)', free: false, pro: true },
    { feature: 'Advanced stats: trends & correlations', free: false, pro: true },
    { feature: 'Monthly mood heatmap (detailed)', free: false, pro: true },
    { feature: 'Mind Constellation (full experience)', free: false, pro: true },
    { feature: 'Advanced search & combined filters', free: false, pro: true },
    { feature: 'Export (CSV, PDF)', free: false, pro: true },
    { feature: 'My Posts: timeline & emotion evolution', free: false, pro: true },
    { feature: 'Priority support', free: false, pro: true },
  ]

  return (
    <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-6 sm:p-8">
      <div className="glow-lamp absolute inset-0" />
      <div className="relative z-10">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Info className="h-4 w-4 text-white/70" />
          <h2 className="text-xl font-semibold text-white">Compare plans</h2>
          <span className="ml-2 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70">
            Premium is coming soon
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-card">
          <div className="grid grid-cols-12 border-b border-white/10 bg-white/5 text-xs text-white/70 sm:text-sm">
            <div className="col-span-6 px-3 py-3 sm:px-4">Feature</div>
            <div className="col-span-3 px-3 py-3 sm:px-4 text-center">Free</div>
            <div className="col-span-3 px-3 py-3 sm:px-4 text-center">Premium</div>
          </div>
          <ul className="divide-y divide-white/10">
            {rows.map((r) => (
              <li key={r.feature} className="grid grid-cols-12 items-center">
                <div className="col-span-6 px-3 py-3 sm:px-4 text-sm text-white/90">{r.feature}</div>
                <div className="col-span-3 px-3 py-3 sm:px-4 text-center">
                  {r.free ? <Check className="mx-auto h-5 w-5 text-emerald-300" /> : <X className="mx-auto h-5 w-5 text-white/40" />}
                </div>
                <div className="col-span-3 px-3 py-3 sm:px-4 text-center">
                  {r.pro ? <Check className="mx-auto h-5 w-5 text-emerald-300" /> : <X className="mx-auto h-5 w-5 text-white/40" />}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* small CTA row under table on mobile */}
        <div className="mt-4 grid grid-cols-1 gap-2 sm:hidden">
          <Link href="/user" className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900">
            Start Free
          </Link>
          <button disabled className="inline-flex items-center justify-center rounded-full bg-pink-600/60 px-4 py-2 text-sm font-medium text-white opacity-70 cursor-not-allowed">
            Premium (coming soon)
          </button>
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const items = [
    {
      q: 'Can I use the app for free?',
      a: 'Yes. The Free plan includes anonymous feed, a “last post” reminder popup, unlimited basic journaling, stats preview, and My Posts (basic). Upgrade to Premium for deeper insights and exports when it launches.',
    },
    {
      q: 'What do I get with Premium?',
      a: 'Journal Lock (PIN / biometric), advanced stats with detailed monthly heatmaps, the full Mind Constellation experience, exports (CSV & PDF), advanced search and combined filters, My Posts timeline & emotion evolution, and priority support. Premium will include a 7‑day free trial at launch.',
    },
    {
      q: 'Can I cancel at any time?',
      a: 'Of course. You can cancel your subscription at any time from the billing page once Premium is available.',
    },
    {
      q: 'Is my data private?',
      a: 'Absolutely. Your data is private by default. We never sell data and we keep the experience ad-free.',
    },
  ]

  return (
    <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-6 sm:p-8">
      <div className="glow-lamp absolute inset-0" />
      <div className="relative z-10">
        <h2 className="mb-4 text-xl font-semibold text-white">Frequently asked questions</h2>
        <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-card">
          {items.map((it, idx) => (
            <details key={it.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
                <span className="text-sm font-medium text-white/90">{it.q}</span>
                <span className="ml-auto h-px flex-1 bg-white/10" />
                <span className="ml-4 rounded-full border border-white/10 bg-white/5 p-1 text-white/70 transition group-open:rotate-45">
                  <PlusIcon />
                </span>
              </summary>
              <div className="px-4 pb-4 text-sm text-white/70 sm:px-6">{it.a}</div>
              {idx !== items.length - 1 && <div className="mx-4 h-px bg-white/10 sm:mx-6" aria-hidden />}
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-6 sm:p-8">
      <div className="glow-lamp absolute inset-0" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/70">
          <Crown className="h-3.5 w-3.5 text-yellow-300" />
          Premium is coming soon
        </div>
        <h3 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Give your mind a calmer, clearer space
        </h3>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          Start free today. When Premium launches, you’ll get a 7‑day free trial.
        </p>

        <div className="mt-5 flex w-full max-w-md flex-col gap-2 sm:flex-row not-prose">
          <button
            disabled
            className="inline-flex w-full items-center justify-center rounded-full bg-pink-600/60 px-5 py-2 text-sm font-semibold !text-white opacity-70 no-underline shadow cursor-not-allowed"
            aria-disabled="true"
          >
            Premium (coming soon)
          </button>

        <Link
            href="/user"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-white px-5 py-2 text-sm font-semibold !text-slate-900 no-underline shadow-sm hover:bg-white/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            Continue Free
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-white/60">
          <span className="inline-flex items-center gap-1">
            <Shield className="h-3.5 w-3.5" /> Private by default
          </span>
          <span className="inline-flex items-center gap-1">
            <Lock className="h-3.5 w-3.5" /> No ads or tracking
          </span>
          <span className="inline-flex items-center gap-1">
            <CreditCard className="h-3.5 w-3.5" /> 7‑day free trial at launch
          </span>
        </div>
      </div>
    </section>
  )
}
