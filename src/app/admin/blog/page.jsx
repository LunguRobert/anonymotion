// app/admin/blog/page.jsx
export const revalidate = 0

import { Suspense } from 'react'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import AdminSearchBar from '@/components/admin/AdminSearchBar'
import AdminRowActions from '@/components/admin/AdminRowActions'

function cx(...s) { return s.filter(Boolean).join(' ') }

function StatusBadge({ published }) {
  return (
    <span className={cx(
      'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs border',
      published ? 'border-secondary text-inverted' : 'border-secondary text-muted'
    )}>
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

function formatDate(d) { try { return new Date(d).toLocaleDateString() } catch { return '' } }

export default async function AdminBlogListPage({ searchParams }) {
  const sp = await searchParams

  const getStr = (key, def = '') => {
    const v = sp?.[key]
    return typeof v === 'string' ? v : Array.isArray(v) ? (v[0] ?? def) : def
  }

  const qRaw = getStr('q', '')
  const statusRaw = getStr('status', 'all')
  const pageRaw = getStr('page', '1')

  const q = qRaw.trim()
  const status = ['all', 'published', 'drafts'].includes(statusRaw) ? statusRaw : 'all'
  const pageNum = Number(pageRaw)
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1

  const limit = 20
  const skip = (page - 1) * limit

  const where = {}
  if (status === 'published') where.published = true
  if (status === 'drafts') where.published = false
  if (q) {
    where.OR = [
      { title:   { contains: q, mode: 'insensitive' } },
      { excerpt: { contains: q, mode: 'insensitive' } },
      { content: { contains: q, mode: 'insensitive' } },
      { tags:    { has: q } },
    ]
  }

  const [items, total, publishedCount, draftCount] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip, take: limit,
      select: {
        id: true, title: true, slug: true, excerpt: true,
        coverImage: true, tags: true, published: true, publishedAt: true, createdAt: true
      }
    }),
    prisma.blogPost.count({ where }),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.blogPost.count({ where: { published: false } }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const baseQS = new URLSearchParams()
  if (q) baseQS.set('q', q)
  if (status !== 'all') baseQS.set('status', status)

  function pageHref(p) {
    const qs = new URLSearchParams(baseQS)
    qs.set('page', String(p))
    return `/admin/blog?${qs.toString()}`
  }
  function statusHref(s) {
    const qs = new URLSearchParams()
    if (q) qs.set('q', q)
    if (s !== 'all') qs.set('status', s)
    qs.set('page', '1')
    return `/admin/blog?${qs.toString()}`
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Header + Stats */}
      <section className="rounded-3xl border border-secondary bg-surface p-6 md:p-8 relative overflow-hidden">
        <div className="glow-lamp absolute inset-0 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-inverted">Blog — Admin</h1>
            <p className="mt-1 text-muted text-sm">Create, edit, and publish posts. Keep it thoughtful and consistent.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/blog/new" className="rounded-full bg-primary px-4 py-2 text-sm text-inverted hover:opacity-90 transition">
              New post
            </Link>
            <Link href="/blog" className="rounded-full border border-secondary px-4 py-2 text-sm text-inverted hover:bg-card transition">
              View public blog
            </Link>
          </div>
        </div>

        {/* Quick stats */}
        <div className="relative z-10 mt-6 grid grid-cols-3 gap-3 md:max-w-md">
          <div className="rounded-2xl border border-secondary bg-card p-4 text-center">
            <div className="text-xs text-muted">Total</div>
            <div className="mt-1 text-inverted text-xl font-semibold">{total}</div>
          </div>
          <div className="rounded-2xl border border-secondary bg-card p-4 text-center">
            <div className="text-xs text-muted">Published</div>
            <div className="mt-1 text-inverted text-xl font-semibold">{publishedCount}</div>
          </div>
          <div className="rounded-2xl border border-secondary bg-card p-4 text-center">
            <div className="text-xs text-muted">Drafts</div>
            <div className="mt-1 text-inverted text-xl font-semibold">{draftCount}</div>
          </div>
        </div>
      </section>

      {/* Toolbar: search + status filter */}
      <section className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <Suspense fallback={null}>
          <AdminSearchBar placeholder="Search posts…" defaultValue={q} />
        </Suspense>
        <nav className="flex items-center gap-2 text-sm">
          <Link href={statusHref('all')} className={cx(
            'rounded-full border px-3 py-1',
            status === 'all' ? 'border-secondary text-inverted' : 'border-secondary text-muted hover:bg-card'
          )}>All</Link>
          <Link href={statusHref('published')} className={cx(
            'rounded-full border px-3 py-1',
            status === 'published' ? 'border-secondary text-inverted' : 'border-secondary text-muted hover:bg-card'
          )}>Published</Link>
          <Link href={statusHref('drafts')} className={cx(
            'rounded-full border px-3 py-1',
            status === 'drafts' ? 'border-secondary text-inverted' : 'border-secondary text-muted hover:bg-card'
          )}>Drafts</Link>
        </nav>
      </section>

      {/* List */}
      <section className="mt-6 grid gap-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-secondary bg-card p-6 text-center">
            <h2 className="text-inverted font-semibold">No posts yet</h2>
            <p className="mt-2 text-muted text-sm">Create your first article to kick things off.</p>
            <div className="mt-4">
              <Link href="/admin/blog/new" className="rounded-full bg-primary px-4 py-2 text-sm text-inverted hover:opacity-90 transition">
                Create post
              </Link>
            </div>
          </div>
        ) : items.map(p => (
          <article key={p.slug} className="grid grid-cols-[96px_1fr_auto] gap-4 rounded-2xl border border-secondary bg-card p-3">
            {/* Thumb */}
            {p.coverImage
              ? <img src={p.coverImage} alt="" loading="lazy" decoding="async" className="h-24 w-24 rounded border border-secondary object-cover" />
              : <div aria-hidden className="h-24 w-24 rounded border border-secondary bg-surface" />
            }

            {/* Meta */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/blog/${p.slug}/edit`} className="text-inverted font-semibold hover:underline">{p.title}</Link>
                <StatusBadge published={p.published} />
              </div>
              <div className="mt-1 text-xs text-muted">
                {p.published ? `Published ${formatDate(p.publishedAt)}` : `Created ${formatDate(p.createdAt)}`} · <code className="text-inverted">{p.slug}</code>
              </div>
              {p.excerpt ? <p className="mt-2 text-sm text-muted line-clamp-2">{p.excerpt}</p> : null}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                {(p.tags || []).slice(0, 4).map(t => (
                  <span key={t} className="rounded-full border border-secondary px-2 py-0.5">#{t}</span>
                ))}
              </div>
            </div>

            {/* Actions (client) */}
            <div className="flex flex-col items-end gap-2">
              <AdminRowActions slug={p.slug} published={p.published} />
            </div>
          </article>
        ))}
      </section>

      {/* Pagination */}
      <section className="mt-6 flex items-center justify-between text-sm">
        <div className="text-muted">Page {page} of {totalPages}</div>
        <div className="flex items-center gap-2">
          <Link
            href={page > 1 ? pageHref(page - 1) : '#'}
            aria-disabled={page === 1}
            className={cx('rounded-full border border-secondary px-3 py-1', page === 1 && 'opacity-50 pointer-events-none')}
          >
            ← Prev
          </Link>
          <Link
            href={page < totalPages ? pageHref(page + 1) : '#'}
            aria-disabled={page === totalPages}
            className={cx('rounded-full border border-secondary px-3 py-1', page === totalPages && 'opacity-50 pointer-events-none')}
          >
            Next →
          </Link>
        </div>
      </section>
    </main>
  )
}
