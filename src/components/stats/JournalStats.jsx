'use client'

import { useEffect, useMemo, useState } from 'react'
import { Pie, Doughnut, Bar } from 'react-chartjs-2'
import 'chart.js/auto'
import Image from 'next/image'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns'
import { getMoodStyles } from '@/utils/mood-utils'
import BadgeChip from '@/components/badges/BadgeChip'
import { Flame } from 'lucide-react'

const POSITIVE = ['HAPPY', 'NEUTRAL']
const NEGATIVE = ['SAD', 'ANGRY', 'ANXIOUS']

export default function JournalStats({ isPremium }) {
  const [heatmap, setHeatmap] = useState(null)     // {'yyyy-mm-dd': 'MOOD'}
  const [trends, setTrends] = useState(null)       // [{ date, mood }]
  const [frequency, setFrequency] = useState(null) // { HAPPY: n, ... }
  const [badges, setBadges] = useState([])         // [{ code, label, emoji, color, earned }]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isPremium) { setLoading(false); return }

    let alive = true
    const readJson = async (res) => {
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        const t = await res.text().catch(() => '')
        throw new Error(t || `Bad response (${res.status})`)
      }
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || `Bad response (${res.status})`)
      return json
    }
    async function load() {
      try {
        setLoading(true); setError('')
        const [h, t, f, b] = await Promise.all([
          fetch('/api/user/stats/journal',   { cache: 'no-store' }),
          fetch('/api/user/stats/trends',    { cache: 'no-store' }),
          fetch('/api/user/stats/frequency', { cache: 'no-store' }),
          fetch('/api/user/badges?scope=journal', { cache: 'no-store' }),
        ])
        const [{ data: heatmapRaw }, { data: trendsRaw }, { frequency: freqRaw }, badgesJson] =
          await Promise.all([readJson(h), readJson(t), readJson(f), readJson(b)])

        if (!alive) return
        const normalized = {}
        for (const k in (heatmapRaw || {})) normalized[String(k)] = heatmapRaw[k]

        setHeatmap(normalized || {})
        setTrends(trendsRaw || [])
        setFrequency(freqRaw || {})
        const earned = Array.isArray(badgesJson?.badges) ? badgesJson.badges.filter(x => x.earned) : []
        setBadges(earned)
      } catch (e) {
        if (!alive) return
        setError(e.message || 'Something went wrong'); setBadges([])
      } finally { if (alive) setLoading(false) }
    }
    load()
    return () => { alive = false }
  }, [isPremium])

  // derived
  const today = new Date()
  const monthDays = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) })

  const balance = useMemo(() => {
    if (!trends?.length) return null
    const total = trends.length
    const positive = trends.reduce((acc, it) => acc + (POSITIVE.includes(it.mood) ? 1 : 0), 0)
    return Math.round((positive / total) * 100)
  }, [trends])

  const freqChart = useMemo(() => {
    if (!frequency) return null
    const moodColors = { HAPPY: '#facc15', SAD: '#60a5fa', ANGRY: '#f87171', ANXIOUS: '#c084fc', NEUTRAL: '#a3a3a3' }
    const labels = Object.keys(frequency)
    const values = Object.values(frequency)
    return {
      labels,
      datasets: [{ data: values, backgroundColor: labels.map(l => moodColors[l] || '#e5e5e5') }],
    }
  }, [frequency])

  // weekday rhythm
  const weekdayChart = useMemo(() => {
    if (!trends?.length) return null
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const counts = Array(7).fill(0)
    for (const t of trends) counts[new Date(t.date).getDay()]++
    return {
      labels: names,
      datasets: [{ data: counts, backgroundColor: '#93c5fd', borderRadius: 6 }],
    }
  }, [trends])

  // streaks + volatility
  const { currentStreak, bestStreak, volatility } = useMemo(() => {
    const out = { currentStreak: 0, bestStreak: 0, volatility: null }
    if (!Array.isArray(trends) || !trends.length) return out
    const days = trends
      .map(t => new Date(t.date))
      .sort((a, b) => a.getTime() - b.getTime()) // asc
    // streaks
    let best = 1, cur = 1
    for (let i = 1; i < days.length; i++) {
      const diff = Math.round((days[i] - days[i - 1]) / 86400000)
      if (diff === 1) { cur++; best = Math.max(best, cur) } else { cur = 1 }
    }
    // current streak (from latest backwards)
    let current = 1
    for (let i = days.length - 1; i > 0; i--) {
      const diff = Math.round((days[i] - days[i - 1]) / 86400000)
      if (diff === 1) current++; else break
    }
    // volatility: % of mood changes between consecutive entries
    let changes = 0
    for (let i = 1; i < trends.length; i++) {
      if (trends[i].mood !== trends[i - 1].mood) changes++
    }
    const vol = Math.round((changes / Math.max(1, trends.length - 1)) * 100)
    return { currentStreak: current || 0, bestStreak: best || 0, volatility: vol }
  }, [trends])

  // UI — gating
  if (!isPremium) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-6 sm:p-8 text-center">
        <div className="glow-lamp absolute inset-0" />
        <div className="relative z-10">
          <h2 className="text-2xl font-semibold tracking-tight text-inverted sm:text-3xl">Journal Insights</h2>
          <p className="text-sm text-muted mt-1 mb-6">Unlock to see your mood heatmap and emotional balance.</p>
          <button
            onClick={() => window.location.assign('/pricing')}
            className="rounded-full bg-pink-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-pink-700 transition"
          >
            Unlock Premium
          </button>
        </div>
      </section>
    )
  }

  if (loading && !error) return <JournalSkeleton />

  return (
    <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-6 sm:p-8">
      <div className="glow-lamp absolute inset-0" />
      <div className="relative z-10">
        <h2 className="text-2xl font-semibold tracking-tight text-inverted sm:text-3xl">Journal Insights</h2>
        <p className="text-sm text-muted mt-1 mb-6">See your mood history and emotional balance.</p>

        {error && (
          <div className="rounded-2xl border border-secondary bg-card p-4 text-center mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {!error && (
          <>
            {/* Top: Heatmap + Balance/Volatility + Weekday */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Heatmap */}
              <Card title="Mood Heatmap" subtitle={format(today, 'MMMM yyyy')}>
                <div className="grid grid-cols-7 gap-2 max-w-lg mx-auto">
                  {monthDays.map((day) => {
                    const key = format(day, 'yyyy-MM-dd')
                    const mood = heatmap?.[key] || 'NONE'
                    const info = getMoodStyles(mood)
                    return (
                      <div
                        key={key}
                        className="flex aspect-square min-w-[25px] flex-col items-center justify-center rounded-md border border-secondary bg-card text-[11px] text-white/80"
                      >
                        <span className="font-medium">{format(day, 'd')}</span>
                        <Image src={info.seal} alt={mood} width={20} height={20} className="mt-1 drop-shadow-sm" />
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] text-white/70">
                  {['HAPPY','SAD','ANGRY','ANXIOUS','NEUTRAL','NONE'].map((m) => (
                    <span key={m} className="inline-flex items-center gap-1">
                      <Image src={getMoodStyles(m).seal} alt={m} width={16} height={16} /> {m}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Balance + Volatility */}
              <Card title="Balance & Volatility">
                {balance === null ? (
                  <p className="text-sm text-muted">Not enough data yet.</p>
                ) : (
                  <div className="mx-auto w-full max-w-[520px]">
                    <div className="relative aspect-[2.2/1] overflow-hidden rounded-lg">
                      <Doughnut
                        data={{
                          labels: ['Positive/Neutral', 'Negative'],
                          datasets: [{ data: [balance, 100 - balance], backgroundColor: ['#4ade80', '#f87171'], borderWidth: 0, circumference: 180, rotation: 270 }],
                        }}
                        options={{ responsive: true, maintainAspectRatio: false, cutout: '88%', layout: { padding: 0 }, plugins: { legend: { display: false }, tooltip: { enabled: false } } }}
                      />
                      <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-3">
                        <div className="text-center">
                          <span className="block text-3xl font-semibold text-white sm:text-4xl">{balance}%</span>
                          <span className="block text-xs text-white/60">Positive</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <SmallBadge label="Volatility" value={`${volatility ?? 0}%`} />
                      <SmallBadge label="Entries" value={trends?.length || 0} />
                    </div>
                  </div>
                )}
                <p className="mt-3 text-center text-xs text-white/60">Positive = HAPPY &amp; NEUTRAL.</p>
              </Card>

              {/* Weekday Rhythm */}
              <Card title="Weekday Rhythm">
                {weekdayChart ? (
                  <div className="w-full max-w-xl mx-auto">
                    <Bar
                      data={weekdayChart}
                      options={{
                        plugins: { legend: { display: false } },
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                      }}
                      height={260}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted">No data yet.</p>
                )}
              </Card>
            </div>

            {/* Streaks */}
            <div className="rounded-2xl border border-secondary bg-card p-4 sm:p-6 mb-6">
              <h3 className="text-lg font-semibold text-inverted mb-3">Streaks</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StreakCard label="Current" value={`${currentStreak} days`} />
                <StreakCard label="Best" value={`${bestStreak} days`} />
                <StreakCard label="Consistency" value={`${balance ?? 0}% positive`} subtle />
              </div>
            </div>

            {/* Frequency */}
            <Card title="Emotion Frequency">
              {freqChart ? (
                <div className="relative mx-auto w-full max-w-[220px] sm:max-w-[240px] md:max-w-[260px] lg:max-w-[280px]">
                  <Pie
                    data={freqChart}
                    options={{
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: '#ddd',
                            boxWidth: 10,
                            padding: 10,
                            // legend font a bit smaller so it never feels crowded
                            font: { size: 10 },
                          },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted">No data yet.</p>
              )}
            </Card>

            {/* Badges */}
            <Card title="Badges">
              {badges.length === 0 ? (
                <p className="text-sm text-muted">No badges yet.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {badges.map(b => (
                    <BadgeChip key={b.code} emoji={b.emoji} label={b.label} color={b.color} />
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </section>
  )
}

/* — helpers — */

function Card({ children, title, subtitle }) {
  return (
    <div className="rounded-2xl border border-secondary bg-card p-4 sm:p-6 mb-6">
      {title && <h3 className="text-lg font-semibold text-inverted mb-1">{title}</h3>}
      {subtitle && <p className="text-xs text-muted mb-3">{subtitle}</p>}
      {children}
    </div>
  )
}

function SmallBadge({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
      <div className="text-[11px] text-white/60">{label}</div>
      <div className="text-sm font-semibold text-white tabular-nums">{value}</div>
    </div>
  )
}

function StreakCard({ label, value, subtle }) {
  return (
    <div className={`rounded-2xl border ${subtle ? 'border-white/10' : 'border-amber-400/30'} bg-white/5 p-3 sm:p-4`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/70">{label}</span>
        {!subtle && <Flame className="h-4 w-4 text-amber-300" />}
      </div>
      <div className="mt-1 text-lg font-semibold text-white tabular-nums">{value}</div>
    </div>
  )
}

function JournalSkeleton() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-6 sm:p-8">
      <div className="glow-lamp absolute inset-0" />
      <div className="relative z-10 space-y-6">
        <div className="h-7 w-56 rounded bg-white/10 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-64 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-64 rounded-2xl bg-white/10 animate-pulse" />
        </div>
        <div className="h-12 rounded-2xl bg-white/10 animate-pulse" />
      </div>
    </section>
  )
}
