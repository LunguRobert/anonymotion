// src/components/marketing/SafetyPledges.jsx
// Server Component — vertical billboard, 0 JS, ultra-scanabil.

import Link from "next/link";

export default function SafetyPledges() {
  const lanes = [
    {
      k: "anon",
      title: "Anonymous by default",
      line: "Posts never show identity.",
      chips: ["No public profiles", "Account reduces spam"],
      Icon: ShieldIcon,
      link: { href: "/privacy", label: "Privacy" },
    },
    {
      k: "report",
      title: "Report & moderation",
      line: "One-tap report. Fast review.",
      chips: ["Auto-hide repeats", "Clear guidelines"],
      Icon: FlagIcon,
      link: { href: "/guidelines", label: "Guidelines" },
    },
    {
      k: "data",
      title: "You own your data",
      line: "Export & delete anytime.",
      chips: ["CSV / JSON / TXT", "No ads"],
      Icon: BoxIcon,
      link: { href: "/account/export", label: "Export" },
    },
  ];

  return (
    <section id="safety" aria-labelledby="safety-title" className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-secondary/60 bg-surface/60 px-3 py-1.5 text-xs text-muted">
          <SparkIcon className="h-3.5 w-3.5" /> Our safety pledge
        </span>
        <h2 id="safety-title" className="mt-3 text-2xl md:text-3xl font-semibold">
          Safety, privacy & control — at a glance
        </h2>
        <p className="mt-2 text-sm text-muted">Simple. Visible. Predictable.</p>
      </div>

      <div className="relative">
        <div className="space-y-5">
          {lanes.map((x, i) => (
            <article key={x.k} className="relative overflow-hidden rounded-3xl border border-secondary/60 bg-card/60 px-5 py-5 md:px-6 md:py-6 sp-lane">
              {/* glow field */}
              <div aria-hidden className="sp-glow" />
              <div className="flex items-start gap-4">
                {/* emblem */}
                <span className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-secondary/60 bg-surface/60 text-accent">
                  <x.Icon className="h-5 w-5" />
                  <i
                    aria-hidden
                    className="pointer-events-none absolute -inset-2 rounded-3xl opacity-0 transition-opacity duration-300 sp-aura"
                    style={{ backgroundImage: "var(--lamp-glow)" }}
                  />
                </span>

                {/* content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-inverted">{x.title}</h3>
                    <span className="rounded-full border border-secondary/60 bg-surface/60 px-2.5 py-1 text-[11px]">Safe</span>
                    <span className="ml-auto hidden text-[12px] text-muted md:inline">
                      0 tracking across the web
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{x.line}</p>
                  {/* chips scurte */}
                  <ul className="mt-3 flex flex-wrap items-center gap-2">
                    {x.chips.map((c, ci) => (
                      <li
                        key={ci}
                        className="rounded-full border border-secondary/60 bg-surface/60 px-2.5 py-1 text-[12px] text-inverted/90"
                      >
                        {c}
                      </li>
                    ))}
                    <li className="ml-auto">
                      <Link
                        href={x.link.href}
                        className="text-[12px] text-inverted border-b border-dashed border-white/25 pb-[2px] underline-offset-4 hover:text-accent hover:border-accent"
                      >
                        {x.link.label}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* notă scurtă jos */}
      <p className="mt-6 text-center text-[12px] text-muted">
        Encryption in transit via HTTPS. Please avoid personal details in posts.
      </p>

      {/* CSS mic, fără styled-jsx */}
      <style>{`
        .sp-lane { transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease; }
        .sp-lane:hover { transform: translateY(-3px); box-shadow: 0 14px 44px rgba(0,0,0,.35); border-color: rgba(255,255,255,.18); }
        .sp-glow {
          position: absolute; inset: -10%;
          background:
            radial-gradient(40% 35% at 10% 50%, rgba(34,211,238,.10), transparent 60%),
            radial-gradient(40% 35% at 90% 40%, rgba(192,132,252,.10), transparent 60%),
            radial-gradient(45% 40% at 40% 90%, rgba(249,168,212,.08), transparent 60%);
          opacity: 0; transition: opacity .25s ease;
        }
        .sp-lane:hover .sp-glow { opacity: 1; }
        .sp-lane:hover .sp-aura { opacity: 1; }
      `}</style>
    </section>
  );
}

/* icons */
function ShieldIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 2 3 6v6c0 5 3.8 9.7 9 10 5.2-.3 9-5 9-10V6l-9-4zM5 7.3v5.2c0 3.9 3.1 7.3 7 7.5 3.9-.2 7-3.6 7-7.5V7.3L12 4.2 5 7.3z"/>
    </svg>
  );
}
function FlagIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M4 4h2v16H4zM8 4h8l-1.5 4L18 12H8z"/>
    </svg>
  );
}
function BoxIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M21 8l-9-5-9 5 9 5 9-5zm-9 7l-9-5v9l9 5 9-5v-9l-9 5z"/>
    </svg>
  );
}
function SparkIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>
    </svg>
  );
}
