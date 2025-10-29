// src/components/marketing/HeroCloud.jsx
// Server Component (no "use client")
import Link from "next/link";

export default function HeroCloud() {
  return (
    <section
      className="relative overflow-hidden bg-surface"
      aria-labelledby="hero-title"
    >
      {/* ===== Background layers (decorative, zero-JS) ===== */}
      {/* Subtle grid + vignette */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0 31px, rgba(255,255,255,.08) 31px 32px), repeating-linear-gradient(90deg, transparent 0 31px, rgba(255,255,255,.08) 31px 32px)",
            maskImage:
              "radial-gradient(120% 80% at 50% 10%, black 60%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(120% 80% at 50% 10%, black 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% -10%, rgba(0,0,0,.45), transparent 60%)",
          }}
        />
      </div>

      {/* Gradient ribbons / glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-28 left-1/2 h-[880px] w-[1280px] -translate-x-1/2 rounded-full blur-3xl opacity-70"
          style={{
            background:
              "conic-gradient(from 220deg at 50% 50%, rgba(34,211,238,.22), rgba(109,40,217,.24), rgba(249,168,212,.16), rgba(34,211,238,.22))",
          }}
        />
        <div
          className="absolute top-40 -left-24 h-[460px] w-[460px] rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(109,40,217,.35), transparent 70%)",
          }}
        />
        <div
          className="absolute top-10 -right-24 h-[520px] w-[520px] rounded-full blur-3xl opacity-35"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(34,211,238,.30), transparent 70%)",
          }}
        />
      </div>

      {/* Curved separators (soft edges) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 opacity-50"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,.06), transparent)",
          maskImage:
            "radial-gradient(80% 100% at 50% 0%, transparent 0, transparent 30%, black 80%)",
          WebkitMaskImage:
            "radial-gradient(80% 100% at 50% 0%, transparent 0, transparent 30%, black 80%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 opacity-40"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,.06), transparent)",
          maskImage:
            "radial-gradient(80% 100% at 50% 100%, transparent 0, transparent 30%, black 80%)",
          WebkitMaskImage:
            "radial-gradient(80% 100% at 50% 100%, transparent 0, transparent 30%, black 80%)",
        }}
      />

      {/* ===== Content ===== */}
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 md:pb-28 md:pt-20">
        {/* Top chips (context) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary/60 bg-card/50 px-3 py-1 text-[12px] text-muted">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: "var(--color-accent)" }}
            />
            100% anonymous — accounts only to reduce spam
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary/60 bg-card/50 px-3 py-1 text-[12px] text-muted">
            Safe space — report & moderation
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          {/* Left: headline & CTA */}
          <div>
            <h1
              id="hero-title"
              className="text-balance text-4xl font-semibold tracking-tight text-inverted md:text-6xl"
            >
              Write how you feel.{" "}
              <span
                className="bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent"
                style={{ filter: "saturate(1.15)" }}
              >
                Anonymously.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-pretty text-base text-muted md:text-lg">
              Share what’s on your mind and get supportive reactions. With{" "}
              <span className="text-inverted/90">Premium</span>, keep a private
              mood journal, see trends, and export your data.
            </p>

            {/* CTA row */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/auth/signin"
                className="inline-flex items-center rounded-xl bg-primary px-5 py-3 font-medium text-inverted ring-primary transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2"
              >
                Start free
              </Link>
              <Link
                href="/?demo=1#demo"
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-xl border border-secondary/60 bg-card/40 px-5 py-3 font-medium text-inverted/90 hover:text-inverted focus-visible:outline-none focus-visible:ring-2 ring-accent"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                See how it works!
              </Link>

            </div>

            {/* Micro trust (single line, compact) */}
            <div className="mt-6 text-sm text-muted">
              No names. No profiles. You control your data.
            </div>
          </div>

          {/* Right: “device preview” — stacked panels (CSS only) */}
          <div className="relative">
            {/* Accent halo */}
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-[2rem] opacity-70 blur-2xl"
              style={{
                background:
                  "conic-gradient(from 160deg at 50% 50%, rgba(34,211,238,.22), rgba(109,40,217,.22), rgba(249,168,212,.16), rgba(34,211,238,.22))",
              }}
            />

            <div className="relative grid gap-5">
            {/* Panel A — Anonymous post */}
            <article className="rounded-2xl border border-secondary/60 bg-card/70 p-0 shadow-sm backdrop-blur min-w-0 overflow-hidden">
              <div className="flex items-center gap-1 border-b border-secondary/50 px-4 py-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }} />
                <span className="h-2.5 w-2.5 rounded-full bg-secondary/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-secondary/80" />
                <span className="ml-2 text-[11px] text-muted lg:text-xs">Anonymous post</span>
              </div>

              <div className="px-4 py-3 lg:px-5 lg:py-4">
                <header className="flex items-center justify-between text-[11px] text-muted lg:text-xs">
                  <span className="truncate">Anonymous</span>
                  <span>just now</span>
                </header>

                <p className="mt-3 text-[14px] leading-6 text-inverted/95 break-words lg:text-[15px]">
                  I’ve been feeling anxious lately. Writing it down helps me breathe a little easier.
                </p>

                {/* Reactions — wrap pe mobil, 1 rând pe desktop */}
                <footer className="mt-4 flex flex-wrap items-center gap-2 lg:mt-5 lg:flex-nowrap lg:gap-3">
                  {[
                    { e: "🙂", label: "Support", count: 128 },
                    { e: "🤗", label: "Empathy", count: 94 },
                    { e: "😟", label: "Concern", count: 33 },
                    { e: "😡", label: "Anger", count: 5 },
                    { e: "🥰", label: "Love", count: 76 },
                  ].map((r) => (
                    <span
                      key={r.label}
                      className="relative inline-flex items-center justify-center rounded-xl border border-secondary/60 bg-card/70 px-2 py-1 text-sm leading-none shadow-sm backdrop-blur transition hover:-translate-y-[1px] hover:border-white/20 lg:px-2.5 lg:py-1.5 lg:text-base"
                      title={r.label}
                      aria-label={`${r.label}: ${r.count}`}
                      role="img"
                    >
                      <span className="select-none">{r.e}</span>
                      <span className="ml-1.5 text-[11px] text-muted tabular-nums">{r.count}</span>

                      {/* glow ținut în card pe mobil; desktop rămâne ca la tine */}
                      <i
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-[0.9rem] opacity-0 transition-opacity duration-300 hover:opacity-100 lg:-inset-1"
                        style={{ backgroundImage: "var(--lamp-glow)" }}
                      />
                    </span>
                  ))}
                </footer>
              </div>
            </article>

            {/* Panel B — Journal heatmap preview */}
            <div className="rounded-2xl border border-secondary/60 bg-surface/70 p-0 shadow-sm backdrop-blur min-w-0 overflow-hidden">
              <div className="flex items-center gap-1 border-b border-secondary/50 px-4 py-2">
                <span className="text-[11px] text-muted lg:text-xs">Private journal</span>
                <span className="ml-auto rounded-full border border-secondary/60 bg-card/50 px-2 py-0.5 text-[10px] text-muted lg:text-[11px]">
                  Premium
                </span>
              </div>
              <div className="px-4 py-3 lg:px-5 lg:py-4">
                {/* pe mobil 8 col, pe desktop 12 col — desktop identic cu al tău */}
                <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 sm:gap-2 lg:grid-cols-12">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-3.5 rounded-md border border-secondary/40"
                      style={{ background: i % 5 === 0 ? "rgba(34,211,238,.18)" : "rgba(255,255,255,.05)" }}
                    />
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-muted lg:text-xs">Spot trends across days and weeks.</p>
              </div>
            </div>

            {/* Panel C — Mini metrics (vertical bars + KPIs) */}
            <div className="rounded-2xl border border-secondary/60 bg-card/60 p-4 shadow-sm backdrop-blur min-w-0 overflow-hidden lg:p-4">
              <div className="grid grid-cols-3 gap-3 lg:gap-4">
                {[
                  { label: "Support", color: "#22d3ee", value: 72 },
                  { label: "Calm",    color: "#c084fc", value: 58 },
                  { label: "Energy",  color: "#f9a8d4", value: 31 },
                ].map((m) => (
                  <div key={m.label} className="flex flex-col items-center">
                    {/* bar container — puțin mai îngust/mai scund pe mobil */}
                    <div className="relative h-20 w-7 overflow-hidden rounded-md border border-secondary/50 bg-surface/70 lg:h-24 lg:w-8">
                      {/* grid ticks */}
                      <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                          background:
                            "repeating-linear-gradient(to top, rgba(255,255,255,.06) 0 1px, transparent 1px 8px)",
                        }}
                      />
                      {/* fill */}
                      <div
                        className="absolute bottom-0 left-0 w-full origin-bottom animate-metric-fill"
                        style={{
                          height: `${m.value}%`,
                          background: `linear-gradient(to top, ${m.color}, rgba(255,255,255,.05))`,
                          boxShadow: `0 0 10px 0 ${m.color}33 inset`,
                        }}
                      />
                    </div>

                    {/* label + value */}
                    <div className="mt-2 text-center">
                      <div className="text-[11px] text-muted lg:text-xs">{m.label}</div>
                      <div className="text-sm font-semibold text-inverted tabular-nums">{m.value}%</div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-[11px] text-muted lg:text-xs">Gentle insights to notice patterns over time.</p>

              {/* animația barelor — neschimbată */}
              <style>{`
                @keyframes metric-fill { from { transform: scaleY(0); } to { transform: scaleY(1); } }
                .animate-metric-fill { animation: metric-fill .9s cubic-bezier(.22,.8,.25,1) both; }
              `}</style>
            </div>
          </div>


          </div>
        </div>

        {/* Bottom CTA pills */}
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <Link
            href="/feed"
            className="inline-flex items-center rounded-full border border-secondary/60 bg-card/40 px-4 py-2 text-sm font-medium hover:text-inverted focus-visible:outline-none focus-visible:ring-2 ring-accent"
          >
            Visit the feed
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-inverted ring-primary transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2"
          >
            See Premium options
          </Link>
        </div>
      </div>
    </section>
  );
}
