// src/components/stats/StatsOverview.jsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Flame, Sparkles } from 'lucide-react'

/**
 * Mini overview card that mixes quick global signals:
 * - Support (from recent reactions across posts)
 * - Calm (NEUTRAL share in journal)
 * - Energy (HAPPY share in journal)
 * - Plus: Current streak & Top emotion quick KPIs
 *
 * All computations are lightweight and based on existing endpoints.
 */

export default function StatsOverview({ isPremium }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feed, setFeed] = useState(null)     // from /api/user/stats/feed
  const [trends, setTrends] = useState(null) // from /api/user/stats/trends

  useEffect(() => {
    let alive = true
    async function readJson(res) {
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        const t = await res.text().catch(() => '')
        throw new Error(t || `Bad response (${res.status})`)
      }
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || `Bad response (${res.status})`)
      return j
    }
    async function load() {
      try {
        setLoading(true); setError('')

        const [feedRes, trendsRes] = await Promise.all([
          fetch('/api/user/stats/feed', { cache: 'no-store' }),
          fetch('/api/user/stats/trends', { cache: 'no-store' }),
        ])
        const [feedJson, trendsJson] = await Promise.all([readJson(feedRes), readJson(trendsRes)])

        if (!alive) return
        setFeed(feedJson || {})
        setTrends((trendsJson?.data) || [])
      } catch (e) {
        if (!alive) return
        setError(e.message || 'Failed to load overview')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  // ----- derive metrics -----
  const mostUsedEmotion = feed?.mostUsedEmotion || null

  // Support: % of supportive reactions in recent posts
  const supportPct = useMemo(() => {
    const posts = Array.isArray(feed?.lastPosts) ? feed.lastPosts : []
    let sup = 0, tot = 0
    const supportive = new Set(['support', 'supportive', 'hug', 'empathy', 'imhere', 'understand'])
    for (const p of posts) {
      const rs = p?.reactions || {}
      for (const [k, v] of Object.entries(rs)) {
        tot += Number(v) || 0
        if (supportive.has(k)) sup += Number(v) || 0
      }
    }
    if (tot === 0) return 0
    return Math.round((sup / tot) * 100)
  }, [feed])

  // Calm & Energy from journal trends share
  const { calmPct, energyPct } = useMemo(() => {
    if (!Array.isArray(trends) || !trends.length) return { calmPct: 0, energyPct: 0 }
    const total = trends.length
    const calm = trends.reduce((a, t) => a + (t.mood === 'NEUTRAL' ? 1 : 0), 0)
    const energy = trends.reduce((a, t) => a + (t.mood === 'HAPPY' ? 1 : 0), 0)
    return {
      calmPct: Math.round((calm / total) * 100),
      energyPct: Math.round((energy / total) * 100),
    }
  }, [trends])

  // Streak (current) from consecutive days present in trends
  const currentStreak = useMemo(() => {
    if (!Array.isArray(trends) || !trends.length) return 0
    const days = trends
      .map(t => new Date(t.date))
      .sort((a, b) => b.getTime() - a.getTime())
    let streak = 1
    for (let i = 1; i < days.length; i++) {
      const diff = Math.round((days[i - 1] - days[i]) / 86400000)
      if (diff === 1) streak++
      else break
    }
    return streak || 0
  }, [trends])

  return (
    <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-4 sm:p-6">
      <div className="glow-lamp absolute inset-0" />
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-inverted">Overview</h2>
          {isPremium ? (
            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-200">
              Premium unlocked
            </span>
          ) : (
            <button
              onClick={() => window.location.assign('/pricing')}
              className="rounded-full bg-pink-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-pink-700"
            >
              Upgrade for deeper insights
            </button>
          )}
        </div>

        {error ? (
          <div className="rounded-2xl border border-secondary bg-card p-3 text-center text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {/* Mini metrics (Support / Calm / Energy) */}
        <div className={`rounded-2xl border border-secondary/60 bg-card/60 p-3 sm:p-4 shadow-sm backdrop-blur min-w-0 overflow-hidden ${error ? 'mt-4' : ''}`}>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: 'Support', color: '#22d3ee', value: supportPct },
              { label: 'Calm',    color: '#c084fc', value: calmPct },
              { label: 'Energy',  color: '#f9a8d4', value: energyPct },
            ].map((m) => (
              <div key={m.label} className="flex flex-col items-center">
                <div className="relative h-20 w-7 overflow-hidden rounded-md border border-secondary/50 bg-surface/70 sm:h-24 sm:w-8">
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: 'repeating-linear-gradient(to top, rgba(255,255,255,.06) 0 1px, transparent 1px 8px)' }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-full origin-bottom animate-metric-fill"
                    style={{
                      height: `${m.value}%`,
                      background: `linear-gradient(to top, ${m.color}, rgba(255,255,255,.05))`,
                      boxShadow: `0 0 10px 0 ${m.color}33 inset`,
                    }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <div className="text-[11px] text-muted sm:text-xs">{m.label}</div>
                  <div className="text-sm font-semibold text-inverted tabular-nums">{m.value}%</div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-muted sm:text-xs text-center">
            Gentle insights to notice patterns over time.
          </p>

          <style>{`
            @keyframes metric-fill { from { transform: scaleY(0); } to { transform: scaleY(1); } }
            .animate-metric-fill { animation: metric-fill .9s cubic-bezier(.22,.8,.25,1) both; }
          `}</style>
        </div>

        {/* Quick KPIs */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi label="Current streak" value={`${currentStreak}d`} icon={<Flame className="h-4 w-4" />} />
          <Kpi label="Top emotion" value={mostUsedEmotion || '—'} icon={<Sparkles className="h-4 w-4" />} />
          <Kpi label="Total posts" value={feed?.postCount ?? 0} />
          <Kpi label="Active days" value={feed?.activeDays ?? 0} />
        </div>
      </div>
    </section>
  )
}

function Kpi({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-secondary bg-card px-3 py-3 sm:px-4 sm:py-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-white/70 sm:text-xs">{label}</span>
        {icon ? <span className="text-white/80">{icon}</span> : null}
      </div>
      <div className="mt-1 text-lg sm:text-xl font-semibold text-white tabular-nums">{value}</div>
    </div>
  )
}
