// app/blog/page.jsx
export const revalidate = 60

import Link from 'next/link'

// ─────────────────────────────────────────────────────────────
// SEO metadata
export const metadata = {
  title: 'Mindfulness & Mental Health Blog | Anonymotion',
  description:
    'Actionable insights on mindfulness, journaling, stress, anxiety, sleep, and emotional fitness. Fresh, research-informed articles to help you feel and live better.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/blog`,
  },
  openGraph: {
    title: 'Mindfulness & Mental Health Blog | Anonymotion',
    description:
      'Actionable insights on mindfulness, journaling, stress, anxiety, sleep, and emotional fitness.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/blog`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mindfulness & Mental Health Blog | Anonymotion',
    description:
      'Actionable insights on mindfulness, journaling, stress, anxiety, sleep, and emotional fitness.',
  },
  robots: { index: true, follow: true },
}

// ─────────────────────────────────────────────────────────────
// Data loader
async function fetchPosts({ tag } = {}) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const qs = new URLSearchParams({ limit: '24', ...(tag ? { tag } : {}) })
  const res = await fetch(`${base}/api/blog?${qs.toString()}`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('Failed to load blog')
  const data = await res.json()
  return data.items || []
}

// Helpers
function buildTags(posts) {
  const map = new Map()
  for (const p of posts) (p.tags || []).forEach(t => map.set(t, (map.get(t) || 0) + 1))
  return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name,count])=>({name,count}))
}
function toISO(d) { try { return new Date(d).toISOString() } catch { return undefined } }

function BlogJsonLd({ posts }) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const json = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: posts.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${base}/blog/${p.slug}`,
        name: p.title,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Anonymotion Blog',
      url: `${base}/blog`,
      description:
        'Mindfulness and mental health articles: journaling, anxiety, stress, sleep, habits, and emotional fitness.',
    },
  ]
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
}

// UI bits (dark-mode, high-contrast)
function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <header className="mx-auto max-w-3xl text-center">
      {eyebrow ? <p className="text-xs uppercase tracking-[0.2em] text-muted">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-inverted">{title}</h2>
      {subtitle ? <p className="mt-3 text-muted">{subtitle}</p> : null}
    </header>
  )
}

function TopicPills({ tags }) {
  if (!tags?.length) return null
  return (
    <nav aria-label="Popular topics" className="mt-6 flex flex-wrap justify-center gap-2">
      {tags.map(t => (
        <Link
          href={`/blog?tag=${encodeURIComponent(t.name)}`}
          key={t.name}
          className="rounded-full border border-secondary px-3 py-1 text-sm text-muted hover:bg-surface hover:text-inverted transition"
        >
          #{t.name} <span className="opacity-60">({t.count})</span>
        </Link>
      ))}
    </nav>
  )
}

function FeaturedCard({ post }) {
  const hasImage = Boolean(post.coverImage)
  return (
    <article className="relative overflow-hidden rounded-3xl border border-secondary bg-surface">
      <div className="glow-lamp absolute inset-0 pointer-events-none" />
      <div className="relative grid md:grid-cols-2 gap-0">
        <div className="p-8 md:p-10">
          <div className="mb-3 inline-flex items-center gap-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1 rounded-full border border-secondary px-2 py-1">
              Featured
            </span>
            {post.publishedAt ? (
              <time dateTime={toISO(post.publishedAt)}>{new Date(post.publishedAt).toLocaleDateString()}</time>
            ) : null}
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-inverted">
            <Link href={`/blog/${post.slug}`} className="transition hover:opacity-90">
              {post.title}
            </Link>
          </h2>
          {post.excerpt ? (
            <p className="mt-4 text-muted leading-relaxed">
              {post.excerpt}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {(post.tags || []).slice(0, 3).map(t => (
              <Link
                key={t}
                href={`/blog?tag=${encodeURIComponent(t)}`}
                className="rounded-full border border-secondary px-3 py-1 text-xs text-muted hover:text-inverted hover:bg-surface transition"
              >
                #{t}
              </Link>
            ))}
            <Link
              href={`/blog/${post.slug}`}
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-inverted hover:opacity-90 transition"
              aria-label={`Read: ${post.title}`}
            >
              Read article →
            </Link>
          </div>
        </div>
        <div className="relative">
          {hasImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover md:rounded-l-none"
            />
          ) : (
            <div aria-hidden className="h-full w-full bg-surface" />
          )}
        </div>
      </div>
    </article>
  )
}

function PostCard({ post }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-secondary bg-card hover:shadow-secondary/30 hover:shadow-lg transition">
      <Link href={`/blog/${post.slug}`} className="block">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="h-48 w-full object-cover"
          />
        ) : (
          <div aria-hidden className="h-48 w-full bg-surface" />
        )}
        <div className="p-5">
          <h3 className="text-lg font-semibold tracking-tight text-inverted group-hover:opacity-90">
            {post.title}
          </h3>
          {post.excerpt ? (
            <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
          ) : null}
          <div className="mt-3 flex items-center justify-between text-xs text-muted">
            <div className="flex gap-2">
              {(post.tags || []).slice(0, 2).map(t => (
                <span key={t} className="rounded-full border border-secondary px-2 py-0.5">#{t}</span>
              ))}
            </div>
            {post.publishedAt ? (
              <time dateTime={toISO(post.publishedAt)}>{new Date(post.publishedAt).toLocaleDateString()}</time>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  )
}

// ─────────────────────────────────────────────────────────────

export default async function BlogIndexPage({ searchParams }) {
  const sp = await searchParams
  const tag = typeof sp?.tag === 'string' ? sp.tag : ''
  const posts = await fetchPosts({ tag })

  const [featured, ...rest] = posts
  const picks = rest.slice(0, 3)
  const latest = rest.slice(3)
  const tags = buildTags(posts)

  return (
    <>
      <BlogJsonLd posts={posts.slice(0, 12)} />

      <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface">
          <div className="glow-lamp absolute inset-0 pointer-events-none" />
          <div className="relative z-10 mx-auto max-w-3xl py-12 md:py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-inverted">
              Mindfulness & mental fitness, for real life.
            </h1>
            <p className="mt-4 text-muted leading-relaxed">
              Evidence-informed guides on journaling, anxiety, stress, sleep, and habits. Practical,
              compassionate, and designed to help you feel better—one small step at a time.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/#app" className="rounded-full bg-primary px-5 py-2 text-sm text-inverted hover:opacity-90 transition">
                Try Anonymotion
              </Link>
              <a href="#latest" className="rounded-full border border-secondary px-5 py-2 text-sm text-inverted hover:bg-card transition">
                Browse articles
              </a>
            </div>
            <TopicPills tags={tags} />
          </div>
        </section>

        {/* FEATURED */}
        {featured ? (
          <section className="mt-12 md:mt-16">
            <SectionTitle
              eyebrow={tag ? `Topic: ${tag}` : 'Editor’s pick'}
              title={tag ? `Best reads on “${tag}”` : 'Start with this'}
              subtitle={tag ? 'Handpicked articles related to your topic.' : 'A timely, practical piece to guide your next mindful step.'}
            />
            <div className="mt-6">
              <FeaturedCard post={featured} />
            </div>
          </section>
        ) : null}

        {/* PICKS */}
        {picks.length ? (
          <section className="mt-12 md:mt-16">
            <SectionTitle
              eyebrow="Curated"
              title="Fresh, practical, science-aware"
              subtitle="Short, focused reads you can finish in 5–7 minutes."
            />
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {picks.map(p => <PostCard key={p.slug} post={p} />)}
            </div>
          </section>
        ) : null}

        {/* LATEST */}
        {latest.length ? (
          <section id="latest" className="mt-12 md:mt-16">
            <SectionTitle
              eyebrow="Latest"
              title="Latest articles"
              subtitle="New insights every week—save your favorites and share what resonates."
            />
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map(p => <PostCard key={p.slug} post={p} />)}
            </div>
            <div className="mt-8 text-center">
              <Link href="/blog?page=2" className="inline-flex items-center gap-2 rounded-full border border-secondary px-5 py-2 text-sm text-inverted hover:bg-card transition">
                Load more →
              </Link>
            </div>
          </section>
        ) : null}

        {/* VALUE SECTION */}
        <section className="mt-16 md:mt-24 rounded-3xl border border-secondary bg-card p-8 md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-inverted">
              What you can expect from this blog
            </h2>
            <div className="mt-5 grid gap-6 text-left md:grid-cols-3">
              <div className="rounded-2xl border border-secondary p-5 bg-surface">
                <h3 className="font-semibold text-inverted">Mindfulness that fits your day</h3>
                <p className="mt-2 text-sm text-muted">
                  One-page guides and checklists to ground yourself in minutes—at work, at home, or on the go.
                </p>
              </div>
              <div className="rounded-2xl border border-secondary p-5 bg-surface">
                <h3 className="font-semibold text-inverted">Evidence-aware, human-first</h3>
                <p className="mt-2 text-sm text-muted">
                  We translate research into compassionate, practical steps. No perfectionism. No guilt.
                </p>
              </div>
              <div className="rounded-2xl border border-secondary p-5 bg-surface">
                <h3 className="font-semibold text-inverted">Built around journaling</h3>
                <p className="mt-2 text-sm text-muted">
                  Structured prompts to help you observe thoughts, feelings, and patterns—without judgment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16 md:mt-24">
          <SectionTitle
            eyebrow="FAQ"
            title="Mindfulness & journaling — quick answers"
            subtitle="A quick primer on our most common questions."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <details className="rounded-2xl border border-secondary bg-card p-5">
              <summary className="cursor-pointer font-medium text-inverted">Is journaling good for anxiety?</summary>
              <p className="mt-2 text-sm text-muted">
                Many people find that naming thoughts and emotions lowers intensity. We recommend short,
                structured prompts and gentle consistency.
              </p>
            </details>
            <details className="rounded-2xl border border-secondary bg-card p-5">
              <summary className="cursor-pointer font-medium text-inverted">How often should I practice mindfulness?</summary>
              <p className="mt-2 text-sm text-muted">
                Start small—1–3 minutes a day—and expand as it feels helpful. Micro-practices add up.
              </p>
            </details>
            <details className="rounded-2xl border border-secondary bg-card p-5">
              <summary className="cursor-pointer font-medium text-inverted">Can mindfulness replace therapy?</summary>
              <p className="mt-2 text-sm text-muted">
                No. It can complement professional care. If you’re in crisis, contact local support lines or a clinician.
              </p>
            </details>
            <details className="rounded-2xl border border-secondary bg-card p-5">
              <summary className="cursor-pointer font-medium text-inverted">Where do I start?</summary>
              <p className="mt-2 text-sm text-muted">
                Try our beginner guides on breath, body scan, and compassionate journaling—short, scriptable routines.
              </p>
            </details>
          </div>
        </section>

        {/* CTA */}
        {/* <section className="mt-16 md:mt-24 text-center">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-secondary bg-surface p-8 md:p-12 relative">
            <div className="glow-lamp absolute inset-0 pointer-events-none" />
            <h3 className="relative text-2xl font-semibold tracking-tight text-inverted">Get mindful updates</h3>
            <p className="relative mt-2 text-muted">
              One thoughtful email, a few times per month. No noise. Unsubscribe anytime.
            </p>
            <div className="relative mt-6 flex items-center justify-center gap-3">
              <Link href="/newsletter" className="rounded-full bg-primary px-5 py-2 text-sm text-inverted hover:opacity-90 transition">
                Subscribe
              </Link>
              <Link href="/blog/rss.xml" className="rounded-full border border-secondary px-5 py-2 text-sm text-inverted hover:bg-card transition">
                RSS feed
              </Link>
            </div>
          </div>
        </section> */}
      </main>
    </>
  )
}
