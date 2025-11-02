// src/components/user/UserHome.jsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import BadgeChip from '@/components/badges/BadgeChip'
import AccountOverview from '@/components/user/AccountOverview'
import { reactionMap as reactionAssets } from '@/lib/reactions'
import LockSettings from '@/components/journal/LockSettings'

function readJsonSafe(res) {
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    return res.text().then((t) => {
      throw new Error(t || `Bad response (${res.status})`)
    })
  }
  return res.json().then((j) => {
    if (!res.ok) throw new Error(j?.error || `Bad response (${res.status})`)
    return j
  })
}

// ===== helpers: mood colors + tiny charts =====
const MOOD_DOT = {
  HAPPY: 'bg-yellow-400',
  SAD: 'bg-blue-400',
  ANGRY: 'bg-red-500',
  ANXIOUS: 'bg-fuchsia-500',
  NEUTRAL: 'bg-gray-400',
}

function buildMoodCounts(posts = []) {
  const acc = { HAPPY:0, SAD:0, ANGRY:0, ANXIOUS:0, NEUTRAL:0 }
  for (const p of posts) acc[p.emotion] = (acc[p.emotion] || 0) + 1
  return acc
}

function lastNDaysCounts(posts = [], n = 14) {
  const now = new Date()
  const keys = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    keys.push(d.toISOString().slice(0, 10)) // YYYY-MM-DD
  }
  const map = new Map(keys.map(k => [k, 0]))
  for (const p of posts) {
    const k = new Date(p.createdAt).toISOString().slice(0, 10)
    if (map.has(k)) map.set(k, map.get(k) + 1)
  }
  return keys.map(k => map.get(k) || 0)
}

function Sparkline({ data = [], width = 260, height = 56 }) {
  const max = Math.max(1, ...data)
  const stepX = data.length > 1 ? width / (data.length - 1) : width
  const pad = 6
  const h = height - pad * 2
  const path = data.reduce((d, v, i) => {
    const x = Math.round(i * stepX * 10) / 10
    const y = Math.round((height - pad - (v / max) * h) * 10) / 10
    return d + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`)
  }, '')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <rect x="0" y="0" width={width} height={height} rx="10" className="fill-white/5 stroke-white/10" />
      <path d={path} className="stroke-[var(--color-primary)]" fill="none" strokeWidth="2" />
    </svg>
  )
}


export default function UserHome({ name, timezone }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [topBadges, setTopBadges] = useState([])
  const [heatmap, setHeatmap] = useState({})
  const [lastPosts, setLastPosts] = useState([])
  const [postCount, setPostCount] = useState(0)
  const [showLock, setShowLock] = useState(false)

  // greeting în funcție de local time
  const greeting = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: timezone })
        .formatToParts(new Date())
      const hour = Number(parts.find(p => p.type === 'hour')?.value || '12')
      if (hour < 5) return 'Good night'
      if (hour < 12) return 'Good morning'
      if (hour < 18) return 'Good afternoon'
      return 'Good evening'
    } catch {
      return 'Welcome'
    }
  }, [timezone])

  // ultimele 7 zile în TZ utilizator
  const last7 = useMemo(() => {
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
    const days = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      days.push(fmt.format(d)) // YYYY-MM-DD
    }
    return days
  }, [timezone])

  // progres săptămânal + streak curent
  const weekStats = useMemo(() => {
    const wrote = last7.map(d => Boolean(heatmap?.[d]))
    const done = wrote.filter(Boolean).length
    // streak curent (dinspre azi spre trecut)
    let streak = 0
    for (let i = wrote.length - 1; i >= 0; i--) {
      if (wrote[i]) streak += 1
      else break
    }
    return { done, total: 7, streak }
  }, [last7, heatmap])

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        // 1) top badges
        const badgesRes = await fetch('/api/user/badges?scope=all', { cache: 'no-store' })
        const badgesJson = await readJsonSafe(badgesRes)
        const top = Array.isArray(badgesJson?.top3) ? badgesJson.top3 : []
        // 2) heatmap (jurnal)
        const journalRes = await fetch('/api/user/stats/journal', { cache: 'no-store' })
        const journalJson = await readJsonSafe(journalRes)
        const map = {}
        for (const k in (journalJson?.data || {})) map[String(k)] = journalJson.data[k]
        // 3) feed (ultimele postări + total)
        const feedRes = await fetch('/api/user/stats/feed', { cache: 'no-store' })
        const feedJson = await readJsonSafe(feedRes)

        if (!alive) return
        setTopBadges(top)
        setHeatmap(map)
        setLastPosts(Array.isArray(feedJson?.lastPosts) ? feedJson.lastPosts.slice(0, 3) : [])
        setPostCount(feedJson?.postCount ?? 0)
      } catch (e) {
        if (!alive) return
        setError(e.message || 'Failed to load your data.')
        setTopBadges([])
        setHeatmap({})
        setLastPosts([])
        setPostCount(0)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-6 sm:p-8">
        <div className="glow-lamp absolute inset-0" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-inverted">
              {greeting}, {name}.
            </h1>
            <p className="text-sm text-muted mt-1">
              Gentle, consistent steps. You’re doing great — one breath at a time.
            </p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 gap-2">
            <Link
              href="/user/journal"
              className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-full bg-pink-600 px-4 text-sm font-medium text-white shadow hover:bg-pink-700 transition"
              aria-label="New Journal Entry"
            >
              New Journal Entry
            </Link>

            <Link
              href="/user/stats"
              className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-4 text-sm text-white hover:bg-white/10 transition"
              aria-label="View Insights"
            >
              View Insights
            </Link>

            <button
              type="button"
              onClick={() => setShowLock(true)}
              className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-4 text-sm text-white hover:bg-white/10 transition cursor-pointer min-[380px]:col-span-2 sm:col-span-1"
              aria-label="Journal Lock"
            >
              Journal Lock
            </button>
          </div>


        </div>

        <div className="mt-6 relative z-10 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-amber-200">🧪</span>
            <div className="flex-1">
              <p className="text-sm text-amber-100">
                <span className="font-medium">Public Beta:</span> you currently have full access to all <span className="font-medium">Premium</span> features for free during our early access period.
                We’d love your feedback to help shape the next version.
              </p>
              <div className="mt-2">
                <Link href="/pricing" className="text-xs underline text-amber-200/90 hover:text-amber-100">
                  Learn more about upcoming plans →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="relative z-10 mt-4 rounded-2xl border border-secondary bg-card p-4 text-center">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
      </section>

      {showLock && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Journal Lock"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-card p-4 sm:p-6 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-inverted">Journal Lock</h3>
              <button
                type="button"
                onClick={() => setShowLock(false)}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition"
                aria-label="Close"
              >
                Close
              </button>
            </div>

            <LockSettings onClose={() => setShowLock(false)} />
          </div>
        </div>
      )}

      {/* Account overview */}
      <AccountOverview />

      {/* TOP ROW: badges + week progress */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Badges */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-secondary bg-card p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-inverted mb-1">Your Top Badges</h3>
          <p className="text-xs text-muted mb-4">Highlights you’ve unlocked so far.</p>
          {loading ? (
            <div className="h-10 rounded-xl bg-white/10 animate-pulse" />
          ) : topBadges.length === 0 ? (
            <p className="text-sm text-muted">No badges yet — your first step is right here ✨</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {topBadges.map((b) => (
                <BadgeChip key={b.code} emoji={b.emoji} label={b.label} color={b.color} />
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link href="/user/badges" className="text-xs text-white/70 hover:underline">
              View all badges →
            </Link>
          </div>
        </motion.div>

        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-secondary bg-card p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-inverted mb-1">This Week</h3>
          <p className="text-xs text-muted mb-4">Journal activity in your timezone.</p>

          {/* Pills for 7 days */}
          <div className="flex flex-wrap gap-2">
            {last7.map((d) => {
              const wrote = Boolean(heatmap?.[d])
              return (
                <span
                  key={d}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs border ${
                    wrote ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/5 text-white/70'
                  }`}
                  title={d}
                >
                  {wrote ? '✓' : '•'} {d.slice(5)}
                </span>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${(weekStats.done / weekStats.total) * 100}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-white/70">
              <span>{weekStats.done}/7 days</span>
              <span>Current streak: {weekStats.streak} {weekStats.streak === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
        </motion.div>

        {/* Today’s Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-secondary bg-card p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-inverted mb-1">Today’s Gentle Prompts</h3>
          <p className="text-xs text-muted mb-4">Pick one — keep it light.</p>
          <ul className="space-y-2 text-sm">
            <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">“What’s one small thing I’m grateful for right now?”</li>
            <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">“What emotion is present? Where do I feel it in my body?”</li>
            <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">“What would ‘5% more ease’ look like today?”</li>
          </ul>
          <div className="mt-4">
            <Link href="/user/journal" className="text-xs text-white/70 hover:underline">
              Open journal →
            </Link>
          </div>
        </motion.div>
      </section>

      {/* SECOND ROW: Recent reflections + Quick insights (revamped) */}
<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Recent reflections — airy horizontal carousel + mood mix */}
  <div className="lg:col-span-2 rounded-2xl border border-secondary bg-card p-0 overflow-hidden">
    {/* header row */}
    <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-6">
      <div>
        <h3 className="text-lg font-semibold text-inverted">Recent reflections</h3>
        <p className="text-xs text-muted">Your latest posts at a glance.</p>
      </div>
      {/* mood mix bar */}
      {lastPosts?.length > 0 && (
        <div className="hidden sm:flex items-center gap-2">
          {Object.entries(buildMoodCounts(lastPosts))
            .filter(([,v]) => v > 0)
            .map(([m, v]) => (
              <span key={m} className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[11px]">
                <span className={`h-2.5 w-2.5 rounded-full ${MOOD_DOT[m] || 'bg-white/40'}`} />
                {m}<span className="opacity-60">· {v}</span>
              </span>
          ))}
        </div>
      )}
    </div>

    {/* distribution bar */}
    {lastPosts?.length > 0 && (
      <div className="mt-3 px-4 sm:px-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 flex">
          {(() => {
            const counts = buildMoodCounts(lastPosts)
            const total = Math.max(1, lastPosts.length)
            const parts = Object.entries(counts).filter(([,v]) => v > 0)
            if (!parts.length) return <div className="h-full w-full bg-white/10" />
            return parts.map(([m, v]) => (
              <div
                key={m}
                className={`h-full ${MOOD_DOT[m] || 'bg-white/30'}`}
                style={{ width: `${(v / total) * 100}%` }}
                title={`${m}: ${v}`}
              />
            ))
          })()}
        </div>
      </div>
    )}

    {/* content strip */}
    <div className="mt-4 px-2 pb-4 sm:px-4 sm:pb-6">
      {loading ? (
        <div className="flex gap-3 overflow-hidden px-2">
          <div className="h-36 w-64 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-36 w-64 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-36 w-64 rounded-2xl bg-white/10 animate-pulse" />
        </div>
      ) : lastPosts?.length === 0 ? (
        <div className="px-4">
          <p className="text-sm text-muted">No posts yet. Your first one can be a single sentence.</p>
        </div>
      ) : (
        <div
          className="
            flex gap-3 overflow-x-auto snap-x snap-mandatory px-2 pt-1 pb-2
            custom-scrollbar
          "
        >
          {lastPosts.map((post) => {
            const emotionSet = reactionAssets[post.emotion] || []
            const reactions = post.reactions || {}
            const dateLabel = new Date(post.createdAt).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' })
            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="
                  snap-start min-w-[260px] sm:min-w-[300px] lg:min-w-[340px]
                  rounded-2xl border border-secondary bg-surface/80 p-3 sm:p-4
                  hover:bg-surface/95 transition
                "
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted">{dateLabel}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]">{post.emotion}</span>
                </div>

                <p className="text-sm text-inverted line-clamp-4 whitespace-pre-wrap">
                  {post.content}
                </p>

                <div className="mt-3 flex items-center justify-center gap-3">
                  {emotionSet.length
                    ? emotionSet.map(({ name, file }) => {
                        const count = reactions[name] || 0
                        return (
                          <span key={name} className="relative inline-flex items-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={file} alt="" className={`h-6 w-6 object-contain ${count ? 'opacity-100' : 'opacity-40'}`} />
                            {count > 0 && (
                              <span className="ml-1 text-[11px] text-muted">{count}</span>
                            )}
                          </span>
                        )
                      })
                    : <span className="text-[11px] text-muted">No reactions yet</span>
                  }
                </div>
              </motion.article>
            )
          })}
        </div>
      )}

      <div className="mt-2 px-2 sm:px-4">
        <a href="/user/posts" className="text-xs text-white/70 hover:underline">View all posts →</a>
      </div>
    </div>
  </div>

  {/* Quick insights — sparkline + compact tiles */}
  <div className="rounded-2xl border border-secondary bg-card p-4 sm:p-6">
    <h3 className="text-lg font-semibold text-inverted mb-1">Quick Insights</h3>
    <p className="text-xs text-muted mb-3">A calm snapshot of your pace.</p>

    {/* sparkline from last 14 days of lastPosts */}
    {lastPosts?.length > 0 ? (
      <div className="mb-4">
        <Sparkline data={lastNDaysCounts(lastPosts, 14)} />
        <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
          <span>14 days</span>
          <span>Posts/day</span>
        </div>
      </div>
    ) : null}

    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="text-[11px] text-muted">Total Posts</div>
        <div className="mt-1 text-xl font-semibold text-inverted">{postCount}</div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="text-[11px] text-muted">Badges</div>
        <div className="mt-1 text-xl font-semibold text-inverted">{topBadges?.length > 0 ? topBadges.length : '—'}</div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="text-[11px] text-muted">This Week</div>
        <div className="mt-1 text-xl font-semibold text-inverted">{`${weekStats?.done ?? 0}/7`}</div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="text-[11px] text-muted">Streak</div>
        <div className="mt-1 text-xl font-semibold text-inverted">{weekStats?.streak ?? 0}</div>
      </div>
    </div>

    <div className="mt-4">
      <a href="/user/stats" className="text-xs text-white/70 hover:underline">Open full insights →</a>
    </div>
  </div>
</section>

    </div>
  )
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
      <div className="text-xl font-semibold text-inverted">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  )
}
