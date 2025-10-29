export const revalidate = 0

import prisma from '@/lib/prisma'
import Link from 'next/link'

function startOfDay(d){const x=new Date(d);x.setHours(0,0,0,0);return x}
function addDays(d, n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function fmt(d){try{return new Date(d).toLocaleDateString()}catch{return ''}}

function makeSeries(rows, field='createdAt', days=30){
  const end = startOfDay(new Date())
  const start = addDays(end, -days+1)
  const map = new Map()
  for(let i=0;i<days;i++){ map.set(startOfDay(addDays(start,i)).getTime(), 0) }
  for(const r of rows){
    const t = startOfDay(r[field]).getTime()
    if (map.has(t)) map.set(t, (map.get(t)||0)+1)
  }
  return { start, days, points: Array.from(map.entries()).map(([k,v])=>({t:+k, v})) }
}
function Spark({ series, height=40, strokeWidth=2 }) {
  const w = 220
  const h = height
  const max = Math.max(1, ...series.points.map(p=>p.v))
  const step = w / Math.max(1, series.points.length - 1)
  const d = series.points.map((p,i)=>{
    const x = i*step
    const y = h - (p.v / max) * (h - strokeWidth) - strokeWidth/2
    return `${i===0?'M':'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="sparkline">
      <path d={d} fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  )
}

function Card({ title, value, hint, children }) {
  return (
    <div className="rounded-2xl border border-secondary bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">{title}</div>
          <div className="mt-1 text-inverted text-2xl font-semibold">{value}</div>
          {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
        </div>
        <div className="text-muted">{children}</div>
      </div>
    </div>
  )
}

export default async function AdminStatsPage() {
  const since = addDays(startOfDay(new Date()), -29)

  const [
    totalUsers,
    premiumUsers,
    totalPosts,
    totalReports,
    usersLast,
    postsLast,
    reportsLast
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: 'PREMIUM' } }),
    prisma.post.count(),
    prisma.report.count(),
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.post.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.report.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ])

  const seriesUsers = makeSeries(usersLast)
  const seriesPosts = makeSeries(postsLast)
  const seriesReports = makeSeries(reportsLast)

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="rounded-3xl border border-secondary bg-surface p-6 md:p-8 relative overflow-hidden">
        <div className="glow-lamp absolute inset-0 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-inverted">Statistics</h1>
            <p className="mt-1 text-muted text-sm">Key metrics and 30-day trends.</p>
          </div>
          <Link href="/admin" className="rounded-full border border-secondary px-4 py-2 text-sm text-inverted hover:bg-card transition">
            Back to Admin
          </Link>
        </div>

        <div className="relative z-10 mt-6 grid gap-3 md:grid-cols-3">
          <Card title="Total users" value={totalUsers} hint={`Premium: ${premiumUsers} · Free: ${totalUsers - premiumUsers}`}>
            <Spark series={seriesUsers} />
          </Card>
          <Card title="Feed posts" value={totalPosts}>
            <Spark series={seriesPosts} />
          </Card>
          <Card title="Reports" value={totalReports}>
            <Spark series={seriesReports} />
          </Card>
        </div>
      </section>

      {/* 30-day table */}
      <section className="mt-6 rounded-2xl border border-secondary bg-card p-5">
        <h2 className="text-inverted font-semibold">Last 30 days</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="border border-secondary bg-surface px-3 py-2 text-inverted">Date</th>
                <th className="border border-secondary bg-surface px-3 py-2 text-inverted">New users</th>
                <th className="border border-secondary bg-surface px-3 py-2 text-inverted">Feed posts</th>
                <th className="border border-secondary bg-surface px-3 py-2 text-inverted">Reports</th>
              </tr>
            </thead>
            <tbody>
              {seriesUsers.points.map((p, i) => {
                const d = new Date(seriesUsers.start.getTime() + i*86400000)
                return (
                  <tr key={i}>
                    <td className="border border-secondary px-3 py-2 text-muted">{fmt(d)}</td>
                    <td className="border border-secondary px-3 py-2 text-inverted">{seriesUsers.points[i].v}</td>
                    <td className="border border-secondary px-3 py-2 text-inverted">{seriesPosts.points[i]?.v ?? 0}</td>
                    <td className="border border-secondary px-3 py-2 text-inverted">{seriesReports.points[i]?.v ?? 0}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
