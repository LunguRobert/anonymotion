// src/components/marketing/pricingBento.jsx
// Server Component — 0 JS, Tailwind + un strop de CSS scoped. Bento premium, airy, performant.

import Link from "next/link";

export default function PremiumBento() {
  return (
    <section id="premium" aria-labelledby="premium-title" className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-6 flex items-end justify-between">
        <h2 id="premium-title" className="text-2xl md:text-3xl font-semibold">Premium unlocks your private space</h2>
        <p className="text-xs text-muted">Journal in private. See trends. Export when you need.</p>
      </div>

      <div className="grid auto-rows-auto md:auto-rows-[1fr] gap-5 md:grid-cols-12">
        {/* A — Private Journal (wide) */}
        <article className="pb-card group relative overflow-hidden rounded-3xl border border-secondary/60 bg-card/60 p-5 md:col-span-7 md:min-h-[360px]">
          <Header icon={LockIcon} title="Private journal" badge="Encrypted" />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {/* entry list mock */}
            <div className="rounded-2xl border border-secondary/50 bg-surface/60 p-4">
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>Recent entries</span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  autosaved
                </span>
              </div>
              <ul className="mt-3 space-y-3 text-sm">
                {[
                  { mood: "#22d3ee", title: "Breathing helped this morning", time: "Today · 08:14" },
                  { mood: "#fbbf24", title: "Walked without my phone",      time: "Yesterday · 18:22" },
                  { mood: "#60a5fa", title: "A bit heavy, but coping",       time: "Mon · 21:03" },
                ].map((x, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full" style={{ background: x.mood }} />
                    <div className="flex-1">
                      <div className="font-medium text-inverted/95">{x.title}</div>
                      <div className="text-[11px] text-muted">{x.time}</div>
                    </div>
                    <span className="rounded-full border border-secondary/50 bg-card/40 px-2 py-0.5 text-[11px] text-muted">#note</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* compose mock */}
            <div className="rounded-2xl border border-secondary/50 bg-surface/60 p-4">
              <div className="text-[11px] text-muted">New entry</div>
              <div className="mt-2 rounded-xl border border-secondary/50 bg-card/50 p-3">
                <p className="line-clamp-4 text-[15px] leading-6 text-inverted/95">
                  “I’ve been a little anxious lately. Writing it here makes room to breathe.”
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-inverted">Save</span>
                <span className="rounded-full border border-secondary/60 bg-card/40 px-3 py-1.5 text-xs text-inverted/80">Add mood</span>
                <span className="ml-auto text-[11px] text-muted">Local draft · Safe</span>
              </div>
            </div>
          </div>

          <FootNote>Only you can see your journal. Posts stay anonymous.</FootNote>
          <Ink />
        </article>

        {/* B — Trends (heatmap + sparkline) */}
        <article className="pb-card group relative overflow-hidden rounded-3xl border border-secondary/60 bg-card/60 p-5 md:col-span-5 md:min-h-[360px]">
          <Header icon={TrendIcon} title="Trends over time" badge="Monthly" />
          <div className="mt-4 rounded-2xl border border-secondary/50 bg-surface/60 p-4">
            {/* heatmap */}
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 7 }).map((_, d) => (
                <div key={d} className="text-center text-[10px] text-muted">{["M","T","W","T","F","S","S"][d]}</div>
              ))}
              {Array.from({ length: 7 * 5 }).map((_, i) => (
                <div key={i} className="h-3.5 rounded-md border border-secondary/40 heat" />
              ))}
            </div>
            {/* sparkline */}
            <div className="mt-4 rounded-lg border border-secondary/40 bg-card/40 p-2">
              <div className="text-[10px] text-muted">Mood trend (last 14 days)</div>
              <div className="mt-2 h-16 w-full rounded bg-surface/60 sparkline" />
            </div>
          </div>
          <FootNote>Spot patterns, keep streaks, and nudge towards balance.</FootNote>
          <Ink />
        </article>

        {/* C — Insights (donut + mix + KPIs) */}
        <article className="pb-card group relative overflow-hidden rounded-3xl border border-secondary/60 bg-card/60 p-5 md:col-span-5 md:min-h-[360px]">
          <Header icon={InsightsIcon} title="Advanced insights" badge="Private" />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {/* donut */}
            <div className="rounded-2xl border border-secondary/50 bg-surface/60 p-4 text-center">
              <div className="text-[11px] text-muted">Mood balance</div>
              <div className="relative mx-auto my-2 h-24 w-24 rounded-full">
                <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(var(--color-success) 68%, rgba(255,255,255,.10) 0)" }} />
                <div className="absolute inset-2 rounded-full bg-card/50 border border-secondary/40" />
              </div>
              <div className="text-sm font-semibold">68%</div>
              <div className="text-[11px] text-muted">positive</div>
            </div>

            {/* mix */}
            <div className="rounded-2xl border border-secondary/50 bg-surface/60 p-4">
              <div className="text-[11px] text-muted">Emotion mix</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
                <Legend c="#fbbf24" t="HAPPY" v="24%" />
                <Legend c="#60a5fa" t="SAD" v="18%" />
                <Legend c="#f43f5e" t="ANGRY" v="12%" />
                <Legend c="#22d3ee" t="ANXIOUS" v="28%" />
                <Legend c="#94a3b8" t="NEUTRAL" v="18%" />
              </div>
              {/* simple bars */}
              <div className="mt-2 space-y-2">
                {[
                  { c: "#22d3ee", w: "72%", l: "Support received" },
                  { c: "#fbbf24", w: "58%", l: "Energy level" },
                ].map((x, i) => (
                  <div key={i} className="h-2 w-full overflow-hidden rounded bg-secondary/30">
                    <div className="h-full" style={{ width: x.w, background: `linear-gradient(to right, ${x.c}, rgba(255,255,255,.10))` }} aria-label={x.l} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <FootNote>Numbers are yours only. No ads. No tracking across the web.</FootNote>
          <Ink />
        </article>

        {/* D — Export & control (wide) */}
        <article className="pb-card group relative overflow-hidden rounded-3xl border border-secondary/60 bg-card/60 p-5 md:col-span-7 md:min-h-[360px]">
          <Header icon={ExportIcon} title="Export & control" badge="Real privacy. Real power." />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {/* LEFT — Exports (Premium) */}
            <div className="rounded-2xl border border-secondary/50 bg-surface/60 p-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-muted">Exports</div>
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-200">
                  Premium
                </span>
              </div>

              <ul className="mt-2 space-y-2 text-sm">
                <li className="flex items-center justify-between rounded-lg border border-secondary/40 bg-card/40 px-3 py-2">
                  <span>PDF (journal & stats)</span>
                  <span className="text-[11px] text-muted">one tap</span>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-secondary/40 bg-card/40 px-3 py-2">
                  <span>CSV (entries & reactions)</span>
                  <span className="text-[11px] text-muted">structured</span>
                </li>
              </ul>

              <p className="mt-3 text-[11px] text-muted">
                You can delete entries anytime. Exports are on-demand and stay private.
              </p>
            </div>

            {/* RIGHT — Controls & Privacy */}
            <div className="rounded-2xl border border-secondary/50 bg-surface/60 p-4">
              <div className="text-[11px] text-muted">Controls & privacy</div>
              <div className="mt-2 grid gap-2">
                {/* Journal Lock — Premium */}
                <div className="flex items-center justify-between rounded-lg border border-secondary/40 bg-card/40 px-3 py-2">
                  <span className="text-sm">Journal Lock (PIN / biometric)</span>
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-200">
                    Premium
                  </span>
                </div>

                {/* Last post reminder — Free (ON) */}
                <div className="flex items-center justify-between rounded-lg border border-secondary/40 bg-card/40 px-3 py-2">
                  <span className="text-sm">“Last post” reminder</span>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-200">
                    Free
                  </span>
                </div>

                {/* Advanced search & filters — Premium */}
                <div className="flex items-center justify-between rounded-lg border border-secondary/40 bg-card/40 px-3 py-2">
                  <span className="text-sm">Advanced search & combined filters</span>
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-200">
                    Premium
                  </span>
                </div>

                {/* Stats preview — Free */}
                <div className="flex items-center justify-between rounded-lg border border-secondary/40 bg-card/40 px-3 py-2">
                  <span className="text-sm">Stats preview widgets</span>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-200">
                    Free
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-inverted ring-primary transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2"
                >
                  Premium (coming soon)
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <p className="mt-2 text-[11px] text-muted">Includes a 7-day free trial at launch.</p>
              </div>
            </div>
          </div>

          <Ink />
        </article>

      </div>


      {/* subtle CSS (scoped by .pb-*) */}
      <style>{`
        .pb-card { transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease; }
        .pb-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,.35); border-color: rgba(255,255,255,.18); }
        .heat { background: rgba(255,255,255,.06); }
        .group:hover .heat:nth-child(7n+1) { background: rgba(34,211,238,.22) }
        .group:hover .heat:nth-child(7n+3) { background: rgba(192,132,252,.20) }
        .group:hover .heat:nth-child(7n+5) { background: rgba(249,168,212,.18) }
        .sparkline {
          background:
            linear-gradient(to top, rgba(255,255,255,.06), transparent 30%),
            radial-gradient(80% 120% at 0% 100%, rgba(34,211,238,.35), transparent 60%),
            radial-gradient(80% 120% at 50% 120%, rgba(192,132,252,.30), transparent 60%),
            radial-gradient(80% 120% at 100% 100%, rgba(249,168,212,.25), transparent 60%);
          -webkit-mask:
            linear-gradient(90deg, #0000 0, #000 6%, #000 12%, #0000 18%),
            linear-gradient(90deg, #0000 0, #000 22%, #000 28%, #0000 34%),
            linear-gradient(90deg, #0000 0, #000 38%, #000 44%, #0000 50%),
            linear-gradient(90deg, #0000 0, #000 54%, #000 60%, #0000 66%),
            linear-gradient(90deg, #0000 0, #000 70%, #000 76%, #0000 82%),
            linear-gradient(90deg, #0000 0, #000 86%, #000 92%, #0000 100%);
          mask-composite: intersect;
        }
      `}</style>
    </section>
  )
}

/* ---------- tiny server-safe subcomponents ---------- */

function Header({ icon: Icon, title, badge }) {
  return (
    <header className="flex items-center gap-3">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-secondary/60 bg-surface/60 text-accent">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="text-base font-semibold text-inverted">{title}</h3>
      <span className="ml-auto rounded-full border border-secondary/60 bg-surface/60 px-2.5 py-1 text-[11px]">{badge}</span>
    </header>
  )
}

function FootNote({ children }) {
  return <p className="mt-3 text-[11px] text-muted">{children}</p>
}

function Legend({ c, t, v }) {
  return (
    <span className="inline-flex items-center gap-2">
      <i className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
      <span className="text-inverted/90">{t}</span>
      <span className="ml-auto text-muted">{v}</span>
    </span>
  )
}

function Toggle({ label, on }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-secondary/40 bg-card/40 px-3 py-2 text-sm">
      <span>{label}</span>
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full ${on ? "bg-accent/70" : "bg-secondary/50"}`}>
        <span className={`h-4 w-4 rounded-full bg-surface shadow transition-transform ${on ? "translate-x-4" : "translate-x-1"}`} />
      </span>
    </label>
  )
}

function Ink() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{ backgroundImage: "var(--lamp-glow)" }}
    />
  )
}

/* icons */
function LockIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm3 8H9V7a3 3 0 1 1 6 0v3Z"/>
    </svg>
  )
}
function TrendIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M3 3h2v16h16v2H3z"/><path fill="currentColor" d="M19 7l-5 5-3-3-5 5-1.5-1.5L11 6l3 3 4.5-4.5z"/>
    </svg>
  )
}
function InsightsIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M3 3h18v2H3zM5 7h4v13H5zm6 5h4v8h-4zm6-8h4v16h-4z"/>
    </svg>
  )
}
function ExportIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M5 20h14v2H5zM12 2l5 5h-3v6h-4V7H7z"/>
    </svg>
  )
}
function ArrowIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M5 12h12l-4-4 1.4-1.4L21.8 14l-7.4 7.4L13 20l4-4H5z"/>
    </svg>
  )
}
