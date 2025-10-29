export const revalidate = 0

import Link from 'next/link'
import prisma from '@/lib/prisma'
import ReportActions from '@/components/admin/ReportActions'

function formatDate(d) { try { return new Date(d).toLocaleString() } catch { return '' } }
function cx(...s){return s.filter(Boolean).join(' ')}

export default async function ReportsPage({ searchParams }) {
  const sp = await searchParams
  const getStr = (k, def='') => typeof sp?.[k] === 'string' ? sp[k] : Array.isArray(sp?.[k]) ? sp[k][0] : def
  const q = getStr('q','').trim()
  const page = Math.max(1, parseInt(getStr('page','1') || '1', 10))
  const limit = 20
  const skip = (page - 1) * limit

  // Filter by reason or post content
  const where = q ? {
    OR: [
      { reason: { contains: q, mode: 'insensitive' } },
      { post: { content: { contains: q, mode: 'insensitive' } } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
    ],
  } : {}

  const [items, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
      include: {
        user: { select: { id: true, email: true, name: true, blocked: true } }, // reporter
        post: {
          select: { id: true, content: true, emotion: true, createdAt: true, userId: true, user: { select: { id: true, email: true, name: true, blocked: true } } }
        }
      }
    }),
    prisma.report.count({ where })
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const queryHref = (p) => {
    const qs = new URLSearchParams()
    if (q) qs.set('q', q)
    qs.set('page', String(p))
    return `/admin/reports?${qs.toString()}`
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="rounded-3xl border border-secondary bg-surface p-6 md:p-8 relative overflow-hidden">
        <div className="glow-lamp absolute inset-0 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-inverted">Reports & moderation</h1>
            <p className="mt-1 text-muted text-sm">Review flagged feed posts. Dismiss, delete, or block users if necessary.</p>
          </div>
          <Link href="/admin" className="rounded-full border border-secondary px-4 py-2 text-sm text-inverted hover:bg-card transition">Back to Admin</Link>
        </div>

        <div className="relative z-10 mt-6">
          <form className="w-full md:max-w-md">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search reason, content, or email…"
              className="w-full rounded-full border border-secondary bg-card px-4 py-2 text-sm text-inverted placeholder:text-muted"
            />
          </form>
        </div>
      </section>

      <section className="mt-6 grid gap-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-secondary bg-card p-6 text-center">
            <h2 className="text-inverted font-semibold">No reports right now</h2>
            <p className="mt-2 text-muted text-sm">Stay tuned — you’ll see newly flagged posts here.</p>
          </div>
        ) : items.map(r => (
          <article key={r.id} className="rounded-2xl border border-secondary bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-muted">
                Reported by <span className="text-inverted">{r.user?.email || 'anonymous'}</span> on {formatDate(r.createdAt)}
              </div>
              <div className="text-xs text-muted">{r.id}</div>
            </div>

            {r.reason ? <p className="mt-2 text-sm text-muted"><span className="text-inverted">Reason:</span> {r.reason}</p> : null}

            <div className="mt-3 rounded-xl border border-secondary bg-surface p-3">
              <div className="text-xs text-muted">Post #{r.post?.id} · by {r.post?.user?.email || 'unknown'} · {formatDate(r.post?.createdAt)}</div>
              <div className="mt-2 text-inverted">{r.post?.content || <em className="text-muted">[no content]</em>}</div>
              {r.post?.emotion ? <div className="mt-2 text-xs text-muted">Emotion: <span className="text-inverted">{r.post.emotion}</span></div> : null}
            </div>

            {/* Actions */}
            <ReportActions
              reportId={r.id}
              postId={r.post?.id}
              authorId={r.post?.user?.id}
              authorBlocked={!!r.post?.user?.blocked}
            />

          </article>
        ))}
      </section>

      {/* Pagination */}
      <section className="mt-6 flex items-center justify-between text-sm">
        <div className="text-muted">Page {page} of {totalPages} · {total} total</div>
        <div className="flex items-center gap-2">
          <Link href={page > 1 ? queryHref(page - 1) : '#'} className={cx('rounded-full border border-secondary px-3 py-1', page === 1 && 'opacity-50 pointer-events-none')}>← Prev</Link>
          <Link href={page < totalPages ? queryHref(page + 1) : '#'} className={cx('rounded-full border border-secondary px-3 py-1', page === totalPages && 'opacity-50 pointer-events-none')}>Next →</Link>
        </div>
      </section>
    </main>
  )
}
