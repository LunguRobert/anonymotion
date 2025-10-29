// src/components/marketing/BlogTeaser.jsx
import Link from "next/link";
import Image from "next/image";

export default function BlogTeaser({
  items = [],
  basePath = "/blog",
  title = "From the blog",
}) {
  const has = Array.isArray(items) && items.length > 0;
  const list = (has ? items : PLACEHOLDERS).slice(0, 3).map((p) => normalize(p, basePath));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: list.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: p.href,
      name: p.title,
    })),
  };

  return (
    <section
      aria-labelledby="blogteaser-title"
      className="mx-auto max-w-7xl px-6 py-12 md:py-16"
    >
      <div className="bt-wrap relative overflow-hidden rounded-3xl border border-secondary/60 bg-surface">
        {/* conic frame subtil */}
        <div aria-hidden className="bt-ring"></div>
        {/* soft lamp glow */}
        <div aria-hidden className="glow-lamp absolute inset-0 pointer-events-none" />

        {/* conținutul are padding separat de rama – bun pe mobil */}
        <div className="relative z-10 px-4 sm:px-6 md:px-8 py-10 md:py-12">
          <header className="mb-6 flex items-end justify-between gap-4">
            <h2
              id="blogteaser-title"
              className="text-2xl md:text-3xl font-semibold tracking-tight text-inverted"
            >
              {title}
            </h2>
            <Link
              href={basePath}
              className="rounded-full border border-secondary/60 bg-card/60 px-3 py-1.5 text-sm font-medium text-inverted transition hover:bg-card focus-visible:outline-none focus-visible:ring-2 ring-accent"
            >
              View all
            </Link>
          </header>

          <div className="grid gap-5 md:grid-cols-3">
            {list.map((p) => (
              <article
                key={p.href}
                className="group relative overflow-hidden rounded-2xl border border-secondary/60 bg-card/60 transition will-change-transform hover:-translate-y-[2px] hover:border-white/20 hover:shadow-[0_14px_40px_rgba(0,0,0,.35)]"
              >
                <Link
                  href={p.href}
                  className="block focus-visible:outline-none focus-visible:ring-2 ring-accent"
                  aria-label={`Read: ${p.title}`}
                >
                  {/* cover */}
                  <div className="relative aspect-[16/9]">
                    {p.cover ? (
                      <Image
                        src={p.cover}
                        alt={p.title}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover"
                        priority={false}
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{ backgroundImage: "var(--lamp-glow)" }}
                      />
                    )}
                  </div>

                  {/* text */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-[11px] text-muted">
                      {p.date && <time dateTime={p.date}>{fmtDate(p.date)}</time>}
                      {p.tag ? (
                        <>
                          <span aria-hidden>•</span>
                          <span className="rounded-full border border-secondary/60 bg-surface/60 px-2 py-0.5">
                            {p.tag}
                          </span>
                        </>
                      ) : null}
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-base font-semibold text-inverted underline-offset-4 group-hover:underline">
                      {p.title}
                    </h3>
                    {p.excerpt ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
                    ) : null}
                  </div>
                </Link>

                {/* accent ring pe hover */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    padding: "2px",
                    background:
                      "conic-gradient(from var(--a,0deg), rgba(34,211,238,.28), rgba(192,132,252,.28), rgba(249,168,212,.22), rgba(34,211,238,.28))",
                    WebkitMask:
                      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    animation: "bt-spin 18s linear infinite",
                  }}
                />
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* CSS local */}
      <style>{`
        .bt-wrap { position: relative; }
        .bt-ring {
          position: absolute; inset: 0; border-radius: 1.5rem; padding: 2px; pointer-events: none;
          background: conic-gradient(from var(--a,0deg),
            rgba(34,211,238,.20),
            rgba(192,132,252,.20),
            rgba(249,168,212,.16),
            rgba(34,211,238,.20)
          );
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          animation: bt-spin 22s linear infinite;
          opacity: .85;
        }
        @property --a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
        @keyframes bt-spin { to { --a: 360deg } }
      `}</style>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}

const PLACEHOLDERS = [
  { slug: "why-anonymous-journaling-helps", title: "Why anonymous journaling helps", excerpt: "Science-backed reasons to write your feelings.", date: "2025-06-28", cover: "", tag: "Wellbeing" },
  { slug: "how-to-react-with-empathy",      title: "How to react with empathy online",   excerpt: "Practical tips to support others without pressure.", date: "2025-06-10", cover: "", tag: "Community" },
  { slug: "private-journal-routine",        title: "A simple routine for a calmer mind", excerpt: "Build a 5-minute habit that sticks.", date: "2025-05-26", cover: "", tag: "Habits" },
];

function normalize(p, basePath) {
  const href =
    (p.slug || "").startsWith("http")
      ? p.slug
      : `${basePath}${p.slug?.startsWith("/") ? "" : "/"}${p.slug || ""}`;
  return {
    href,
    title: p.title || "Untitled",
    excerpt: p.excerpt || "",
    date: p.date || "",
    cover: p.cover || "",
    tag: p.tag || "",
  };
}

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}
