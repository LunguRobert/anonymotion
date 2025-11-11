// app/blog/[slug]/page.jsx
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import prisma from '@/lib/prisma'

export const revalidate = 60

// ------ data helpers ------
async function getPost(slug) {
  return prisma.blogPost.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      tags: true,
      published: true,
      publishedAt: true,
      createdAt: true,
      // author removed from UI, but keeping for potential future use:
      author: { select: { name: true } },
    },
  })
}

async function getRelated(currentId, tags) {
  if (!tags?.length) return []
  return prisma.blogPost.findMany({
    where: {
      published: true,
      id: { not: currentId },
      OR: tags.map(t => ({ tags: { has: t } })),
    },
    orderBy: { publishedAt: 'desc' },
    take: 6,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      tags: true,
    },
  })
}

async function getPrevNext(date) {
  const [prev, next] = await Promise.all([
    prisma.blogPost.findFirst({
      where: { published: true, publishedAt: { lt: date } },
      orderBy: { publishedAt: 'desc' },
      select: { slug: true, title: true },
    }),
    prisma.blogPost.findFirst({
      where: { published: true, publishedAt: { gt: date } },
      orderBy: { publishedAt: 'asc' },
      select: { slug: true, title: true },
    }),
  ])
  return { prev, next }
}

function wordsPerMinute(text) {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

function slugify(str = '') {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function extractToc(md = '') {
  const lines = md.split('\n')
  const items = []
  for (const line of lines) {
    const m2 = /^##\s+(.*)/.exec(line)
    const m3 = /^###\s+(.*)/.exec(line)
    if (m2) items.push({ depth: 2, text: m2[1].trim(), id: slugify(m2[1]) })
    if (m3) items.push({ depth: 3, text: m3[1].trim(), id: slugify(m3[1]) })
  }
  return items
}

// ------ SEO ------
export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post || !post.published) return {}

  const title = (post.title || 'Untitled').trim()
  const description = (post.excerpt || '').trim()
  const cover = (post.coverImage && /^https?:\/\//.test(post.coverImage))
    ? post.coverImage
    : '/images/blog/placeholder.jpg'

  const url = `/blog/${post.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      images: [{ url: cover }],
      article: {
        publishedTime: post.publishedAt?.toISOString?.(),
        modifiedTime: (post.updatedAt || post.publishedAt)?.toISOString?.(),
        authors: post.author?.name ? [post.author.name] : undefined,
        tags: Array.isArray(post.tags) ? post.tags : undefined,
      },
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [cover],
    },
  }
}

// ------ page ------
export default async function BlogPostPage({ params }) {
  const { slug } = await params
  if (!slug || typeof slug !== 'string') return notFound()

  let post
  try {
    post = await getPost(slug)
  } catch (e) {
    console.error('BLOG_FETCH_ERROR', slug, e)
    return notFound()
  }
  if (!post || !post.published) return notFound()

  const title   = (post.title || 'Untitled').trim()
  const excerpt = (post.excerpt || '').trim()
  const content = typeof post.content === 'string' ? post.content : ''
  const tags    = Array.isArray(post.tags) ? post.tags.filter(Boolean) : []
  const dateISO = (post.publishedAt || post.createdAt)?.toISOString?.() || ''
  const dateObj = post.publishedAt || post.createdAt
  const cover   = (post.coverImage && /^https?:\/\//.test(post.coverImage))
    ? post.coverImage
    : '/images/blog/placeholder.jpg'
  const readMin = wordsPerMinute(content)

  const [related, prevNext] = await Promise.all([
    getRelated(post.id, tags),
    getPrevNext(dateObj),
  ])

  // absolute URL for share/canonical
  const hdrs = headers()
  const host = process.env.NEXT_PUBLIC_SITE_URL || `https://${hdrs.get('host')}`
  const canonical = `${host}/blog/${post.slug}`

  const toc = extractToc(content)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
      {/* BREADCRUMB */}
      <nav className="mb-6 text-sm text-white/60">
        <Link href="/blog" className="hover:text-white/90 transition">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-white/80">{title}</span>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-6 sm:p-10">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(50%_60%_at_50%_0%,rgba(255,255,255,0.06),rgba(0,0,0,0))]" />
        <div className="relative z-10 grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-inverted">
              {title}
            </h1>
            {excerpt ? (
              <p className="mt-3 text-base text-white/80 max-w-2xl">{excerpt}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/60">
              {dateISO ? (
                <time dateTime={dateISO}>
                  {new Date(dateISO).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </time>
              ) : null}
              <span className="opacity-60">•</span>
              <span>{readMin} min read</span>
              {/* author intentionally omitted */}
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-1"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Cover */}
          <figure className="lg:col-span-2">
            <Image
              src={cover}
              alt={title}
              width={1200}
              height={630}
              className="w-full h-auto rounded-2xl border border-secondary bg-card object-cover"
              priority
            />
          </figure>
        </div>
      </section>

      <div className="mt-10 grid lg:grid-cols-[1fr_300px] gap-8">
        {/* BODY + CTA + RELATED + PREV/NEXT */}
        <div className="min-w-0 space-y-10">
          {/* ARTICLE */}
          <article className="rounded-3xl border border-secondary bg-card p-6 sm:p-8 leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeSlug,
                [rehypeAutolinkHeadings, {
                  behavior: 'wrap',
                  properties: { className: ['hover:underline', 'decoration-white/30'] },
                }],
              ]}
              components={{
                h1: (props) => <h2 {...props} className="mt-8 text-2xl font-semibold text-inverted" />,
                h2: (props) => <h3 {...props} className="mt-7 text-xl font-semibold text-inverted" />,
                h3: (props) => <h4 {...props} className="mt-6 text-lg font-semibold text-inverted" />,
                p:  (props) => <p {...props} className="mt-3 text-[15px] leading-7 text-white/90" />,
                ul: (props) => <ul {...props} className="mt-3 list-disc pl-5 text-[15px] text-white/90 space-y-1.5" />,
                ol: (props) => <ol {...props} className="mt-3 list-decimal pl-5 text-[15px] text-white/90 space-y-1.5" />,
                a: (props) => (
                <a
                    {...props}
                    className="underline decoration-white/40 hover:decoration-white text-white/90 break-words"
                    style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                blockquote: (props) => <blockquote {...props} className="mt-4 border-l-2 border-white/20 pl-4 text-white/80 italic" />,
                code: (props) => <code {...props} className="rounded bg-white/10 px-1 py-0.5 text-[13px]" />,
                pre:  (props) => <pre {...props} className="mt-4 overflow-x-auto rounded-xl bg-black/40 p-4 text-sm" />,
                hr:   (props) => <hr {...props} className="my-6 border-white/10" />,
                table:(props) => <div className="mt-4 overflow-x-auto"><table {...props} className="w-full text-sm" /></div>,
                th:   (props) => <th {...props} className="border-b border-white/10 px-3 py-2 text-left font-semibold text-white/90" />,
                td:   (props) => <td {...props} className="border-b border-white/5 px-3 py-2 text-white/80" />,
              }}
            >
              {content || '_No content available yet._'}
            </ReactMarkdown>
          </article>

          {/* CTA — fully responsive */}
          <section className="rounded-3xl border border-secondary bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-xl font-semibold text-inverted">Enjoyed this article?</h3>
                <p className="mt-1 text-white/80 max-w-prose">
                  Try our app and see how it can boost your daily productivity.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center rounded-xl bg-white text-black px-4 py-2.5 font-medium hover:opacity-90 transition w-full sm:w-auto"
                >
                  Start for free
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-2.5 font-medium text-white hover:bg-white/10 transition w-full sm:w-auto"
                >
                  See pricing
                </Link>
              </div>
            </div>
          </section>

          {/* RELATED */}
          {related.length ? (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-inverted">Related articles</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map((r) => (
                  <Link key={r.id} href={`/blog/${r.slug}`} className="group rounded-2xl border border-secondary bg-card overflow-hidden hover:border-white/20 transition">
                    <div className="aspect-[16/9] overflow-hidden">
                      <Image
                        src={r.coverImage && /^https?:\/\//.test(r.coverImage) ? r.coverImage : '/images/blog/placeholder.jpg'}
                        alt={r.title}
                        width={640}
                        height={360}
                        className="h-full w-full object-cover group-hover:scale-[1.02] transition"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-white group-hover:underline">{r.title}</h4>
                      {r.excerpt ? <p className="mt-1 text-sm text-white/70 line-clamp-2">{r.excerpt}</p> : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(r.tags || []).slice(0,3).map(t => (
                          <span key={t} className="text-[11px] rounded-full bg-white/5 border border-white/10 px-2 py-0.5">{t}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* PREV / NEXT */}
          {(prevNext.prev || prevNext.next) && (
            <section className="flex flex-col sm:flex-row justify-between gap-4">
              {prevNext.prev ? (
                <Link href={`/blog/${prevNext.prev.slug}`} className="flex-1 rounded-2xl border border-secondary bg-card p-4 hover:border-white/20 transition">
                  <div className="text-xs text-white/60">Previous article</div>
                  <div className="font-medium text-white hover:underline">{prevNext.prev.title}</div>
                </Link>
              ) : <div className="flex-1" />}
              {prevNext.next ? (
                <Link href={`/blog/${prevNext.next.slug}`} className="flex-1 text-right rounded-2xl border border-secondary bg-card p-4 hover:border-white/20 transition">
                  <div className="text-xs text-white/60">Next article</div>
                  <div className="font-medium text-white hover:underline">{prevNext.next.title}</div>
                </Link>
              ) : <div className="flex-1" />}
            </section>
          )}
        </div>

        {/* SIDEBAR: TOC + SHARE */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {toc.length ? (
              <div className="rounded-2xl border border-secondary bg-card p-4">
                <div className="text-sm font-semibold text-inverted mb-3">Contents</div>
                <nav className="space-y-1">
                  {toc.map((i, idx) => (
                    <a
                      key={idx}
                      href={`#${i.id}`}
                      className={`block text-[13px] text-white/80 hover:text-white/100 transition ${i.depth === 3 ? 'pl-4' : ''}`}
                    >
                      {i.text}
                    </a>
                  ))}
                </nav>
              </div>
            ) : null}

            <div className="rounded-2xl border border-secondary bg-card p-4">
              <div className="text-sm font-semibold text-inverted mb-3">Share</div>
              <div className="flex flex-wrap gap-2">
                <a
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(canonical)}`}
                  target="_blank" rel="noopener noreferrer"
                >
                  X/Twitter
                </a>
                <a
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}`}
                  target="_blank" rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
                <a
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`}
                  target="_blank" rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </div>
              <div className="mt-3 text-[12px] text-white/60 break-all">
                <span className="opacity-70">Link: </span>{canonical}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
