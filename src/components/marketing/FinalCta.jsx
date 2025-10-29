// src/components/marketing/FinalCta.jsx
// Server Component — zero JS, dark-mode, performant & SEO-friendly.

import Link from "next/link";

export default function FinalCta({
  title = "Write how you feel — anonymously.",
  subtitle = "Join a calmer corner of the internet. Post feelings without names, get gentle reactions, and keep a private journal when you’re ready.",
  primaryHref = "/auth/signin",       // ajustează la /signup dacă ai pagină separată
  primaryLabel = "Start free",
  secondaryHref = "/?demo=1#demo",                // ancorează la demo-ul tău
  secondaryLabel = "See how it works",
}) {
  return (
    <section id="final-cta" aria-labelledby="final-cta-title" className="mx-auto max-w-7xl px-6 py-16">
      <div className="fc-wrap relative overflow-hidden rounded-3xl border border-secondary/60 bg-surface">
        {/* ring decor animat (subtil) */}
        <div aria-hidden className="fc-ring" />
        {/* soft glow */}
        <div aria-hidden className="glow-lamp absolute inset-0 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-3xl text-center px-6 py-12 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary/60 bg-card/60 px-3 py-1.5 text-xs text-muted">
            <SparkIcon className="h-3.5 w-3.5" /> Ready to feel lighter?
          </span>

          <h2 id="final-cta-title" className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-inverted">
            {title}
          </h2>
          <p className="mt-3 text-base text-muted leading-relaxed">
            {subtitle}
          </p>

          {/* acțiuni */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-inverted ring-primary transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2"
            >
              {primaryLabel}
              <ArrowIcon className="h-4 w-4" />
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex items-center gap-2 rounded-full border border-secondary/60 bg-card/60 px-6 py-3 text-sm font-medium text-inverted transition hover:bg-card focus-visible:outline-none focus-visible:ring-2 ring-accent"
            >
              {secondaryLabel}
            </Link>
          </div>

          {/* beneficii ultra-scurte */}
          <ul className="mt-7 flex flex-wrap items-center justify-center gap-3 text-[12px]">
            <Chip icon={ShieldIcon} label="Anonymous by default" />
            <Chip icon={FlagIcon}   label="One-tap report" />
            <Chip icon={BoxIcon}    label="Export & delete" />
            <Chip icon={EyeOff}     label="No public profiles" />
          </ul>

          {/* notițe scurte de încredere */}
          <p className="mt-4 text-[12px] text-muted">
            Sign-in required to post (spam control). Encryption in transit via HTTPS. Please avoid personal details in posts.
          </p>
        </div>
      </div>

      {/* CSS mic, fără styled-jsx */}
      <style>{`
        .fc-wrap { position: relative; }
        .fc-ring {
          position: absolute; inset: 0; border-radius: 1.5rem; padding: 2px; pointer-events: none;
          background: conic-gradient(from var(--a,0deg),
            rgba(34,211,238,.28),
            rgba(192,132,252,.28),
            rgba(249,168,212,.22),
            rgba(34,211,238,.28)
          );
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          animation: fc-spin 22s linear infinite;
          opacity: .9;
        }
        @property --a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
        @keyframes fc-spin { to { --a: 360deg } }
      `}</style>
    </section>
  );
}

/* ---------- subcomponents ---------- */

function Chip({ icon: Icon, label }) {
  return (
    <li className="inline-flex items-center gap-2 rounded-full border border-secondary/60 bg-card/60 px-3 py-1.5">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-secondary/60 bg-surface/60 text-accent">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-inverted/90">{label}</span>
    </li>
  );
}

/* ---------- icons (server-safe) ---------- */

function SparkIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>
    </svg>
  );
}
function ArrowIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M5 12h12l-4-4 1.4-1.4L21.8 14l-7.4 7.4L13 20l4-4H5z"/>
    </svg>
  );
}
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
function EyeOff({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M2.3 2.3 1 3.6l4 4C3 9 2 10.5 2 12c2.5 4.5 6.5 7 10 7 2 0 4-.7 5.8-2l3.6 3.6 1.3-1.3L2.3 2.3zM12 7c2.8 0 5 2.2 5 5 0 .4-.1.9-.2 1.3l-2-2C14.7 11.1 15 10.6 15 10a3 3 0 0 0-3-3c-.6 0-1.1.3-1.3.8l-2-2C9.1 7.1 9.6 7 10 7h2zm0 10c-3.2 0-6.3-2-8.4-5 1-1.5 2.3-2.8 3.8-3.7l1.6 1.6a5 5 0 0 0 6.2 6.2l1.6 1.6c-1.4.6-2.9.9-4.8.9z"/>
    </svg>
  );
}
