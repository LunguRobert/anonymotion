// src/components/marketing/FaqPlain.jsx
// Server Component — zero JS, accesibil, include JSON-LD pentru FAQPage.

import Link from "next/link";

const faqs = [
  {
    q: "Is my identity shown anywhere?",
    a: "No. Posts display only your text and the selected mood. There are no public profiles or follower counts. Sign-in is required only to reduce spam and help moderation.",
  },
  {
    q: "Do I need an account to write?",
    a: "Yes—an account is required to post or react, but your identity is never shown on the feed. This keeps spam low and enables rate-limiting and reporting.",
  },
  {
    q: "What does Premium unlock?",
    a: "A private journal, advanced insights and trends, and extra controls. Posting anonymously to the public feed works on the free plan. Exports and delete are available from your account.",
  },
  {
    q: "How are posts moderated?",
    a: "Every post has a one-tap report. Repeated flags auto-hide content until review. Clear community guidelines help keep the space calm and kind.",
  },
  {
    q: "Can I export or delete my data?",
    a: "Yes. You can export entries and reactions (CSV/JSON/TXT) and delete entries from your account anytime. Data is encrypted in transit via HTTPS.",
  },
  {
    q: "Is Anonymotion a substitute for therapy?",
    a: "No. It can complement professional care, but it is not a replacement. If you’re in crisis, contact local support lines or a clinician.",
  },
];

function slug(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function FaqPlain({ title = "FAQ" }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-7xl px-6 py-16">
      {/* Header */}
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Quick answers</p>
        <h2 id="faq-title" className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-inverted">
          {title}
        </h2>
        <p className="mt-3 text-muted">
          A short primer on anonymity, moderation, and data controls.
        </p>
      </header>

      {/* Items */}
      <div className="mt-8 space-y-4">
        {faqs.map((item) => (
          <details
            key={item.q}
            id={slug(item.q)}
            className="group relative overflow-hidden rounded-2xl border border-secondary/60 bg-card/60"
          >
            {/* subtle conic ring (hover/open) */}
            <div aria-hidden className="fq-ring" />
            <summary className="list-none cursor-pointer select-none p-5 md:p-6">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-secondary/60 bg-surface/60 text-accent">
                  <Chevron className="h-4 w-4 transition group-open:rotate-180" />
                </span>
                <h3 className="text-base font-semibold text-inverted">{item.q}</h3>
              </div>
            </summary>
            <div className="px-5 pb-5 md:px-6 md:pb-6">
              <p className="text-sm text-muted">{item.a}</p>

              {/* quick links (contextual) */}
              <div className="mt-3 flex flex-wrap gap-3 text-[12px]">
                {/pricing/.test(item.q) && (
                  <Link href="/pricing" className="underline-offset-4 hover:underline hover:text-inverted">
                    See Premium
                  </Link>
                )}
                {/moderated/.test(item.q) || /report/i.test(item.q) ? (
                  <Link href="/guidelines" className="underline-offset-4 hover:underline hover:text-inverted">
                    Community guidelines
                  </Link>
                ) : null}
                {/export|delete/i.test(item.q) ? (
                  <>
                    <Link href="/account/export" className="underline-offset-4 hover:underline hover:text-inverted">
                      Export data
                    </Link>
                    <Link href="/privacy" className="underline-offset-4 hover:underline hover:text-inverted">
                      Privacy policy
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </details>
        ))}
      </div>

      {/* Foot note */}
      <p className="mt-6 text-center text-[12px] text-muted">
        Encryption in transit via HTTPS. Please avoid personal details in posts.
      </p>

      {/* Scoped CSS (no styled-jsx) */}
      <style>{`
        details > summary::-webkit-details-marker { display: none; }
        .fq-item { transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease; }
        .fq-ring { position: absolute; inset: 0; border-radius: 1rem; pointer-events: none; }
        .fq-ring::before {
          content: ""; position: absolute; inset: 0; border-radius: 1rem; padding: 2px;
          background: conic-gradient(from var(--a,0deg),
            rgba(34,211,238,.28), rgba(192,132,252,.28), rgba(249,168,212,.22), rgba(34,211,238,.28));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: 0; transition: opacity .25s ease; animation: fq-spin 18s linear infinite paused;
        }
        .group:hover .fq-ring::before,
        .group[open] .fq-ring::before { opacity: .9; animation-play-state: running; }
        @property --a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
        @keyframes fq-spin { to { --a: 360deg } }
      `}</style>

      {/* SEO: JSON-LD for FAQs */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}

function Chevron({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M12 15.5 6.5 10l1.4-1.4L12 12.7l4.1-4.1L17.5 10z" />
    </svg>
  );
}
