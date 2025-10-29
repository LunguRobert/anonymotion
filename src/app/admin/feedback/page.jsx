'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCcw,
  Download,
  Search,
  Filter,
  Star,
  MessageCircleHeart,
  CalendarRange,
  Mail,
  Bug,
  Sparkles,
  Heart,
  Lightbulb,
  ChevronDown,
} from 'lucide-react'

export default function AdminFeedbackPage() {
  return <FeedbackAdminClient />
}

function FeedbackAdminClient() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // filters
  const [q, setQ] = useState('')
  const [types, setTypes] = useState(['feature', 'bug', 'praise', 'other'])
  const [ratingMin, setRatingMin] = useState(1)
  const [ratingMax, setRatingMax] = useState(5)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortDir, setSortDir] = useState('desc') // by createdAt

  // pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch feedback')
      const data = await res.json()
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (e) {
      setError(e.message || 'Error loading feedback.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // derive stats
  const stats = useMemo(() => {
    const total = items.length
    const byType = { feature: 0, bug: 0, praise: 0, other: 0 }
    let withEmail = 0
    let avgRating = 0
    let cntRating = 0
    for (const it of items) {
      const t = (it.type || 'OTHER').toString().toLowerCase()
      if (byType[t] != null) byType[t]++
      if (it.email) withEmail++
      if (typeof it.rating === 'number') { avgRating += it.rating; cntRating++ }
    }
    avgRating = cntRating ? (avgRating / cntRating) : 0
    return { total, byType, withEmail, avgRating: Number(avgRating.toFixed(2)), cntRating }
  }, [items])

  // filter
  const filtered = useMemo(() => {
    const qx = q.trim().toLowerCase()
    const df = dateFrom ? new Date(dateFrom + 'T00:00:00') : null
    const dt = dateTo ? new Date(dateTo + 'T23:59:59') : null
    return items.filter((it) => {
      // type
      const t = (it.type || 'OTHER').toString().toLowerCase()
      if (!types.includes(t)) return false
      // rating
      const r = typeof it.rating === 'number' ? it.rating : null
      if (r != null && (r < ratingMin || r > ratingMax)) return false
      // date
      const d = new Date(it.createdAt)
      if (df && d < df) return false
      if (dt && d > dt) return false
      // search
      if (qx) {
        const hay = [
          it.message || '',
          it.email || '',
          it.from || '',
          it.ip || '',
          it.ua || '',
          it.id || '',
        ].join(' ').toLowerCase()
        if (!hay.includes(qx)) return false
      }
      return true
    }).sort((a, b) => {
      const da = new Date(a.createdAt).getTime()
      const db = new Date(b.createdAt).getTime()
      return sortDir === 'asc' ? da - db : db - da
    })
  }, [items, q, types, ratingMin, ratingMax, dateFrom, dateTo, sortDir])

  // pagination derived
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  const pageItems = filtered.slice(start, end)

  useEffect(() => { setPage(1) }, [q, types, ratingMin, ratingMax, dateFrom, dateTo, pageSize])

  const toggleType = (t) => {
    setTypes((prev) => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const exportCSV = () => {
    const rows = filtered.map((it) => ({
      id: it.id,
      createdAt: it.createdAt,
      type: it.type,
      rating: it.rating ?? '',
      message: it.message?.replace(/\n/g, ' '),
      email: it.email ?? '',
      from: it.from ?? '',
      ip: it.ip ?? '',
      ua: it.ua ?? '',
    }))
    const header = Object.keys(rows[0] || { id: '', createdAt: '', type: '', rating: '', message: '', email: '', from: '', ip: '', ua: '' })
    const csv = [header.join(','), ...rows.map(r => header.map(h => csvEscape(r[h])).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `feedback_export_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur-xl dark:bg-zinc-950/60">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-white shadow">
                <MessageCircleHeart className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">User Feedback</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Review and search submissions from your app.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5">
                <RefreshCcw className="h-4 w-4" /> Refresh
              </button>
              <button onClick={exportCSV} disabled={!filtered.length} className="inline-flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-sm text-white shadow hover:shadow-md disabled:opacity-40 dark:bg-white dark:text-black">
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search message, email, source, IP…"
                  className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-400 dark:border-white/10 dark:bg-zinc-900"
                />
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="flex flex-wrap items-center gap-2">
                <Chip icon={Sparkles} active={types.includes('feature')} onClick={() => toggleType('feature')}>Feature</Chip>
                <Chip icon={Bug} active={types.includes('bug')} onClick={() => toggleType('bug')}>Bug</Chip>
                <Chip icon={Heart} active={types.includes('praise')} onClick={() => toggleType('praise')}>Praise</Chip>
                <Chip icon={Lightbulb} active={types.includes('other')} onClick={() => toggleType('other')}>Other</Chip>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-400 dark:border-white/10 dark:bg-zinc-900" />
                </div>
                <div className="relative">
                  <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-400 dark:border-white/10 dark:bg-zinc-900" />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary filters */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 dark:border-white/10">
              <Filter className="h-4 w-4 text-zinc-400" />
              <span className="opacity-70">Rating:</span>
              <StarRow value={ratingMin} onChange={(v) => setRatingMin(v)} label="min" />
              <span>–</span>
              <StarRow value={ratingMax} onChange={(v) => setRatingMax(v)} label="max" />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 dark:border-white/10">
              <span className="opacity-70">Sort</span>
              <button onClick={() => setSortDir(s => s === 'desc' ? 'asc' : 'desc')} className="rounded-lg border px-2 py-1 text-xs hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5">
                Date {sortDir === 'desc' ? '↓' : '↑'}
              </button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="opacity-70">Page size</span>
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="rounded-lg border px-2 py-1 text-xs dark:border-white/10 dark:bg-zinc-900">
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Avg rating" value={stats.cntRating ? `${stats.avgRating} / 5` : '—'} />
          <StatCard label="With email" value={stats.withEmail} />
          <StatCard label="Features / Bugs" value={`${stats.byType.feature} / ${stats.byType.bug}`} />
        </div>

        {/* List */}
        <div className="mt-6">
          {loading ? (
            <SkeletonList />
          ) : error ? (
            <div className="rounded-2xl border p-6 text-red-600 dark:border-white/10">{error}</div>
          ) : pageItems.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900">
              {/* Header row (desktop) */}
              <div className="hidden grid-cols-12 gap-3 border-b px-4 py-3 text-xs uppercase tracking-wider text-zinc-500 dark:border-white/10 md:grid">
                <div className="col-span-4">Message</div>
                <div className="col-span-2">Meta</div>
                <div className="col-span-2">User</div>
                <div className="col-span-2">Source</div>
                <div className="col-span-2 text-right">When</div>
              </div>

              <AnimatePresence initial={false}>
                {pageItems.map((it) => (
                  <motion.div
                    key={it.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="border-b px-4 py-4 dark:border-white/10"
                  >
                    {/* Desktop row */}
                    <div className="hidden grid-cols-12 gap-3 md:grid">
                      <div className="col-span-4">
                        <TypeBadge type={it.type} />
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-100">{it.message}</p>
                      </div>
                      <div className="col-span-2 text-sm">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Stars n={it.rating} />
                          <span className="ml-1 text-xs text-zinc-500">{it.rating ?? '—'}</span>
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">id: <span className="font-mono">{shortId(it.id)}</span></div>
                      </div>
                      <div className="col-span-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-zinc-400" />
                          <span className="truncate">{it.email || '—'}</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-zinc-600 dark:text-zinc-300">
                        <span className="rounded-lg bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">{it.from || 'app'}</span>
                      </div>
                      <div className="col-span-2 text-right text-sm text-zinc-500">
                        {formatDate(it.createdAt)}
                      </div>
                    </div>

                    {/* Mobile card */}
                    <div className="md:hidden">
                      <div className="flex items-center justify-between">
                        <TypeBadge type={it.type} />
                        <div className="flex items-center gap-1 text-amber-500"><Stars n={it.rating} /></div>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-100">{it.message}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span className="rounded-lg bg-zinc-100 px-2 py-1 dark:bg-zinc-800">{it.from || 'app'}</span>
                        <span>{formatDate(it.createdAt)}</span>
                        <span className="font-mono">{shortId(it.id)}</span>
                      </div>
                      {it.email && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-zinc-400" />
                          <span className="truncate">{it.email}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Footer / pagination */}
              <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-zinc-500">
                  Showing <b>{start + 1}</b>–<b>{Math.min(end, filtered.length)}</b> of <b>{filtered.length}</b>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-xl border px-3 py-2 text-sm disabled:opacity-40 dark:border-white/10">
                    Prev
                  </button>
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">Page {currentPage} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-xl border px-3 py-2 text-sm disabled:opacity-40 dark:border-white/10">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Chip({ children, active, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ' +
        (active
          ? 'border-fuchsia-400 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300'
          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300')
      }
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/60 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/60">
      <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  )
}

function Stars({ n }) {
  const count = Math.max(0, Math.min(5, Number(n) || 0))
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={'h-4 w-4 ' + (i < count ? 'fill-amber-500 text-amber-500' : 'text-zinc-300 dark:text-zinc-600')} />
      ))}
    </div>
  )
}

function StarRow({ value, onChange, label }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const v = i + 1
          const active = v <= value
          return (
            <button key={v} onClick={() => onChange(v)} aria-label={`${label} ${v}`} className={'p-1 ' + (active ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-600')}>
              <Star className={'h-4 w-4 ' + (active ? 'fill-current' : '')} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TypeBadge({ type }) {
  const t = (type || 'OTHER').toString().toLowerCase()
  const map = {
    feature: { label: 'Feature', class: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-400/30', Icon: Sparkles },
    bug: { label: 'Bug', class: 'bg-red-500/10 text-red-600 dark:text-red-300 border-red-400/30', Icon: Bug },
    praise: { label: 'Praise', class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-400/30', Icon: Heart },
    other: { label: 'Other', class: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-400/30', Icon: Lightbulb },
  }
  const m = map[t] || map.other
  const Icon = m.Icon
  return (
    <span className={'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ' + m.class}>
      <Icon className="h-3.5 w-3.5" /> {m.label}
    </span>
  )
}

function SkeletonList() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse border-b p-4 dark:border-white/10">
          <div className="mb-2 h-4 w-32 rounded bg-zinc-200/80 dark:bg-zinc-800" />
          <div className="h-4 w-full rounded bg-zinc-200/80 dark:bg-zinc-800" />
          <div className="mt-2 h-4 w-3/5 rounded bg-zinc-200/80 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed p-10 text-center dark:border-white/10">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-white shadow">
        <MessageCircleHeart className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No feedback yet</h3>
      <p className="mt-1 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        Once users submit feedback from the app, it will appear here. Try changing filters or refreshing.
      </p>
    </div>
  )
}

function formatDate(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch { return iso }
}

function shortId(id) {
  if (!id) return '—'
  return String(id).slice(0, 6) + '…' + String(id).slice(-4)
}

function csvEscape(val) {
  if (val == null) return ''
  const s = String(val)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}
