export const revalidate = 0

import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Plan } from '@prisma/client' // enumul tău (FREE/PRO/etc.)

function Card({ title, value, hint }) {
  return (
    <div className="rounded-2xl border border-secondary bg-card p-5">
      <div className="text-sm text-muted">{title}</div>
      <div className="mt-1 text-inverted text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  )
}

function formatDate(d) {
  try { return new Date(d).toLocaleDateString() } catch { return '' }
}

export default async function AdminHomePage() {
  // orice plan care NU e FREE e considerat plătit
  const paidWhere =
    Plan && Plan.FREE
      ? { NOT: { plan: Plan.FREE } }   // când enumul există la runtime
      : { NOT: { plan: 'FREE' } }      // fallback defensiv

  const [users, paidUsers, posts, reactions, reports, lastPost] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: paidWhere }),
    prisma.post.count(),
    prisma.reaction.count(),
    prisma.report.count(),
    prisma.post.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true },
    }),
  ])

  const free = users - paidUsers

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="rounded-3xl border border-secondary bg-surface p-6 md:p-8 relative overflow-hidden">
        <div className="glow-lamp absolute inset-0 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-inverted">Admin</h1>
            <p className="mt-1 text-muted text-sm">Quick overview and shortcuts.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/blog/new"
              className="rounded-full bg-primary px-4 py-2 text-sm text-inverted hover:opacity-90 transition"
            >
              New blog post
            </Link>
            <Link
              href="/admin/reports"
              className="rounded-full border border-secondary px-4 py-2 text-sm text-inverted hover:bg-card transition"
            >
              Moderate reports
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Total users" value={users} hint={`Paid: ${paidUsers} · Free: ${free}`} />
          <Card title="Feed posts" value={posts} />
          <Card title="Reactions" value={reactions} />
          <Card title="Open reports" value={reports} />
        </div>
      </section>

      {/* Quick links */}
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Link href="/admin/blog" className="rounded-2xl border border-secondary bg-card p-5 hover:bg-surface transition">
          <div className="text-inverted font-semibold">Blog manager</div>
          <div className="text-sm text-muted mt-1">Create, edit and publish articles.</div>
        </Link>
        <Link href="/admin/reports" className="rounded-2xl border border-secondary bg-card p-5 hover:bg-surface transition">
          <div className="text-inverted font-semibold">Reports & moderation</div>
          <div className="text-sm text-muted mt-1">Handle flagged feed content.</div>
        </Link>
        <Link href="/admin/feedback" className="rounded-2xl border border-secondary bg-card p-5 hover:bg-surface transition">
          <div className="text-inverted font-semibold">Feedback</div>
          <div className="text-sm text-muted mt-1">Read and export user feedback.</div>
        </Link>
        <Link href="/admin/statistics" className="rounded-2xl border border-secondary bg-card p-5 hover:bg-surface transition">
          <div className="text-inverted font-semibold">Statistics</div>
          <div className="text-sm text-muted mt-1">Usage and growth metrics.</div>
        </Link>
      </section>

      {/* Latest activity */}
      <section className="mt-6 rounded-2xl border border-secondary bg-card p-5">
        <h2 className="text-inverted font-semibold">Latest activity</h2>
        <div className="text-sm text-muted mt-2">
          {lastPost ? (
            <>Last feed post on <span className="text-inverted">{formatDate(lastPost.createdAt)}</span></>
          ) : (
            'No feed posts yet.'
          )}
        </div>
      </section>
    </main>
  )
}
