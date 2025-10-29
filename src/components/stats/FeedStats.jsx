'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import 'chart.js/auto'
import Image from 'next/image'
import BadgeChip from '@/components/badges/BadgeChip'
import { Trophy, ArrowRight } from 'lucide-react'
import { reactionMap as reactionAssets } from '@/lib/reactions'
import { motion } from 'framer-motion'

const EMO_GRAD = {
  NEUTRAL: 'from-gray-600 via-gray-500 to-gray-400',
  HAPPY: 'from-yellow-400 via-pink-400 to-orange-400',
  SAD: 'from-blue-500 via-indigo-600 to-purple-700',
  ANGRY: 'from-red-600 via-orange-700 to-red-800',
  ANXIOUS: 'from-teal-500 via-purple-500 to-fuchsia-600',
}


const EMO_COLORS = {
  HAPPY:   '#facc15',
  NEUTRAL: '#a3a3a3',
  SAD:     '#60a5fa',
  ANGRY:   '#f87171',
  ANXIOUS: '#c084fc',
}

const EMO_COPY = {
  HAPPY:   { headline: 'Joyful spark',  blurb: 'Your positive tone resonated.',     prompts: ['Share one win', 'Pay it forward'] },
  SAD:     { headline: 'Gentle day',    blurb: 'People offered support.',           prompts: ['Note one comfort', 'Text a friend'] },
  ANGRY:   { headline: 'Strong voice',  blurb: 'Turn the energy into action.',      prompts: ['Write 3 next steps', 'Take a short walk'] },
  ANXIOUS: { headline: 'Steady breath', blurb: 'Empathy showed up today.',          prompts: ['Box breathing ×3', 'Name 3 safe things'] },
  NEUTRAL: { headline: 'Clear skies',   blurb: 'Balanced, open tone.',              prompts: ['Capture a thought', 'Tiny gratitude'] },
}

function topReaction(reactions = {}) {
  const entry = Object.entries(reactions || {}).sort((a,b)=>b[1]-a[1])[0]
  return entry ? { name: entry[0], count: entry[1] } : { name: null, count: 0 }
}


export default function FeedStats() {
  const [stats, setStats] = useState({
    postCount: 0,
    activeDays: 0,
    mostUsedEmotion: null,
    emotionDistribution: [],
    lastPosts: [],
  })
  const [feedBadges, setFeedBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    const readJson = async (res) => {
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        const t = await res.text()
        throw new Error(t || `Bad response (${res.status})`)
      }
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed')
      return json
    }
    async function load() {
      try {
        setLoading(true); setError('')
        const [feedRes, badgesRes] = await Promise.all([
          fetch(`/api/user/stats/feed`, { cache: 'no-store' }),
          fetch(`/api/user/badges?scope=feed`, { cache: 'no-store' }),
        ])
        const feedData = await readJson(feedRes)
        const badgesJson = await readJson(badgesRes).catch(() => ({ badges: [] }))
        const earned = Array.isArray(badgesJson.badges) ? badgesJson.badges.filter(b => b.earned) : []

        if (!alive) return
        setStats({
          postCount: feedData.postCount ?? 0,
          activeDays: feedData.activeDays ?? 0,
          mostUsedEmotion: feedData.mostUsedEmotion ?? null,
          emotionDistribution: Array.isArray(feedData.emotionDistribution) ? feedData.emotionDistribution : [],
          lastPosts: Array.isArray(feedData.lastPosts) ? feedData.lastPosts : [],
        })
        setFeedBadges(earned)
      } catch (e) {
        if (!alive) return
        setError(e.message || 'Something went wrong')
        setFeedBadges([])
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  // charts
  const distChart = useMemo(() => {
    const labels = (stats.emotionDistribution || []).map(e => e.emotion)
    const data = (stats.emotionDistribution || []).map(e => e.count)
    return {
      labels,
      datasets: [{ label: 'Posts', data, backgroundColor: labels.map(l => EMO_COLORS[String(l).toUpperCase()] || '#e5e5e5'),
 borderRadius: 6 }],
    }
  }, [stats.emotionDistribution])

  const reactionMix = useMemo(() => {
    const acc = {}
    for (const p of stats.lastPosts || []) {
      const r = p?.reactions || {}
      for (const [k, v] of Object.entries(r)) acc[k] = (acc[k] || 0) + (Number(v) || 0)
    }
    const entries = Object.entries(acc).sort((a, b) => b[1] - a[1])
    return {
      labels: entries.map(([k]) => k),
      datasets: [{ data: entries.map(([, v]) => v) }],
      top: entries.slice(0, 4),
      total: entries.reduce((s, [, v]) => s + v, 0),
    }
  }, [stats.lastPosts])

  // best post by total reactions
  const bestPost = useMemo(() => {
    let best = null
    let max = -1
    for (const p of stats.lastPosts || []) {
      const r = p?.reactions || {}
      const sum = Object.values(r).reduce((s, v) => s + (Number(v) || 0), 0)
      if (sum > max) { max = sum; best = { ...p, totalReactions: sum } }
    }
    return best
  }, [stats.lastPosts])

  return (
    <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-6 sm:p-8">
      <div className="glow-lamp absolute inset-0" />
      <div className="relative z-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-inverted sm:text-3xl">Feed Insights</h2>
            <p className="text-sm text-muted mt-1">Your posting activity and reactions overview.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-secondary bg-card p-4 text-center mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {loading && !error ? <FeedSkeleton /> : null}

        {/* Summary KPIs */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 ${loading ? 'hidden' : ''}`}>
          <MiniStat label="Total Posts" value={stats.postCount} />
          <MiniStat label="Active Days" value={stats.activeDays} />
          <MiniStat label="Most Used" value={stats.mostUsedEmotion || '—'} />
          <MiniStat
            label="Avg Reactions (last)"
            value={(function () {
              const lp = stats.lastPosts || []
              if (!lp.length) return '0'
              const total = lp.reduce((s, p) => {
                const r = p?.reactions || {}
                return s + Object.values(r).reduce((a, v) => a + (Number(v) || 0), 0)
              }, 0)
              return (total / lp.length).toFixed(1)
            })()}
          />
        </div>

        {/* 2-up: Emotion Distribution + Reaction Mix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl border border-secondary bg-card p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-inverted mb-3">Emotion Distribution</h3>
            <div className="w-full max-w-xl mx-auto">
              <Bar
                data={distChart}
                options={{
                  plugins: { legend: { display: false } },
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                }}
                height={260}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-secondary bg-card p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-inverted mb-3">Reaction Mix (latest posts)</h3>
            {reactionMix.total === 0 ? (
              <p className="text-sm text-muted">No reactions yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative mx-auto w-full max-w-[260px]">
                  <Doughnut
                    data={{
                      labels: reactionMix.labels,
                      datasets: [{ data: (reactionMix.datasets[0].data), backgroundColor: reactionMix.labels.map((_, i) => `hsl(${(i*47)%360} 85% 65%)`) }],
                    }}
                    options={{ plugins: { legend: { display: false } }, maintainAspectRatio: true }}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <ul className="space-y-2">
                    {(reactionMix.top || []).map(([name, count]) => (
                      <li key={name} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                        <span className="text-sm capitalize text-white/90">{name}</span>
                        <span className="text-sm text-white/70 tabular-nums">{count}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[11px] text-white/60">
                    Based on visible recent posts.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

{/* Best Performing Post — responsive & richer */}
<motion.section
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25 }}
  className="mb-6"
>
  <div className="flex items-center justify-between gap-3 mb-3">
    <div className="flex items-center gap-2">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
        <Trophy className="h-4 w-4 text-white/90" />
      </span>
      <div>
        <h3 className="text-lg font-semibold text-inverted leading-tight">Best Performing Post</h3>
        <p className="text-xs text-muted">Most engagement across your recent activity.</p>
      </div>
    </div>
    {bestPost && (
      <a
        href="/user/posts"
        className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition"
        title="Open in My Posts"
      >
        Open <ArrowRight className="h-3.5 w-3.5" />
      </a>
    )}
  </div>

  {/* layout: pe desktop două coloane; pe mobil stack */}
  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
    {/* LEFT: cardul postării — max width ca să nu fie prea mare pe desktop */}
    <div className="rounded-2xl border border-secondary bg-card p-0 overflow-hidden self-start">
      {!bestPost ? (
        <div className="p-4 sm:p-6 text-sm text-muted">Not enough data yet.</div>
      ) : (
        <div className="mx-auto w-full max-w-3xl">
          {/* gradient pe emoție */}
          <div className={`bg-gradient-to-br ${EMO_GRAD[bestPost.emotion] || 'from-slate-600 to-slate-800'} p-4 sm:p-5 text-white`}>
            <div className="mb-2 flex items-center justify-between text-[11px]">
              <span className="opacity-90">
                {new Date(bestPost.createdAt).toLocaleString(undefined, { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
              </span>
              <span className="rounded-full bg-black/25 px-2 py-0.5">{bestPost.emotion}</span>
            </div>

            <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">
              {bestPost.content}
            </p>

            {/* reacții — pe mobil: row scroll, no-wrap; pe desktop: centrate */}
            <div className="mt-4 -mx-1 px-1">
              <div
                className="
                  flex flex-nowrap items-center gap-2 overflow-x-auto custom-scrollbar
                  sm:justify-center
                "
              >
                {(() => {
                  const set = reactionAssets[bestPost.emotion] || []
                  const r = bestPost.reactions || {}
                  if (!set.length) {
                    return <span className="text-[11px] text-white/85">No reactions yet</span>
                  }
                  return set.map(({ name, file }) => {
                    const count = r[name] || 0
                    return (
                      <span key={name} className="snap-start shrink-0 inline-flex items-center rounded-full bg-black/20 px-2 py-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={file} alt="" className="h-5 w-5 object-contain" />
                        <span className="ml-1 text-[11px]">{count}</span>
                      </span>
                    )
                  })
                })()}
              </div>
            </div>
          </div>

          {/* bară mix + total */}
          <div className="flex items-center justify-between gap-3 bg-white/5 px-4 py-3">
            <div className="flex-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 flex">
                {(() => {
                  const r = bestPost.reactions || {}
                  const entries = Object.entries(r).filter(([,v]) => v > 0)
                  const total = Math.max(1, entries.reduce((a,[,v]) => a+v, 0))
                  if (!entries.length) return <div className="h-full w-full bg-white/10" />
                  return entries.map(([k, v]) => (
                    <div
                      key={k}
                      className="h-full"
                      style={{ width: `${(v / total) * 100}%`, background: 'linear-gradient(90deg, rgba(255,255,255,.35), rgba(255,255,255,.15))' }}
                      title={`${k}: ${v}`}
                    />
                  ))
                })()}
              </div>
            </div>
            <div className="ml-3 shrink-0 text-right">
              <div className="text-[11px] text-white/70">Total reactions</div>
              <div className="text-sm font-semibold text-inverted">{bestPost.totalReactions ?? 0}</div>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* RIGHT — Mood Insights (ascuns pe mobil, vizibil pe md+) */}
<div className="hidden md:block rounded-2xl border border-secondary bg-card p-4 sm:p-5 self-start lg:sticky lg:top-4">
  {!bestPost ? (
    <div className="text-sm text-muted">Insights will appear once you have more activity.</div>
  ) : (
    (() => {
      const emo = String(bestPost.emotion || 'NEUTRAL').toUpperCase()
      const copy = EMO_COPY[emo] || EMO_COPY.NEUTRAL
      const { name: topName, count: topCount } = topReaction(bestPost.reactions || {})
      const set = (reactionAssets[emo] || [])
      const topIcon = set.find(x => x.name === topName)?.file
      return (
        <div className="space-y-4">
          {/* Mood snapshot */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-[11px] text-muted mb-1">Mood snapshot</div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-white/50" />
              <div>
                <div className="text-sm font-medium text-inverted">{copy.headline}</div>
                <div className="text-xs text-white/70">{copy.blurb}</div>
              </div>
            </div>
          </div>

          {/* Community response */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-[11px] text-muted mb-1">Community response</div>
            {topName ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={topIcon || '/favicon.ico'} alt="" className="h-5 w-5 object-contain" />
                  <span className="text-sm text-inverted">{topName}</span>
                </div>
                <span className="text-sm text-white/80">{topCount}</span>
              </div>
            ) : (
              <div className="text-sm text-white/70">People are still arriving.</div>
            )}
          </div>

          {/* Tiny prompts */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-[11px] text-muted mb-2">Tiny prompts</div>
            <div className="flex flex-wrap items-center gap-2">
              {copy.prompts.map((p) => (
                <span key={p} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/90">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    })()
  )}
</div>

  </div>
</motion.section>


        {/* Badges */}
        <div className="rounded-2xl border border-secondary bg-card p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-inverted mb-4">Badges</h3>
          {feedBadges.length === 0 ? (
            <p className="text-sm text-muted">No badges yet.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {feedBadges.map(b => (
                <BadgeChip key={b.code} emoji={b.emoji} label={b.label} color={b.color} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-secondary bg-card p-3 text-center sm:p-4">
      <p className="text-[11px] text-white/60">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function FeedSkeleton() {
  return (
    <div className="space-y-8 mb-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-24 rounded-2xl bg-white/10 animate-pulse" />
        <div className="h-24 rounded-2xl bg-white/10 animate-pulse" />
        <div className="h-24 rounded-2xl bg-white/10 animate-pulse" />
      </div>
      <div className="h-64 rounded-2xl bg-white/10 animate-pulse" />
      <div className="space-y-3">
        <div className="h-16 rounded-2xl bg-white/10 animate-pulse" />
        <div className="h-16 rounded-2xl bg-white/10 animate-pulse" />
        <div className="h-16 rounded-2xl bg-white/10 animate-pulse" />
      </div>
      <div className="h-10 rounded-2xl bg-white/10 animate-pulse" />
    </div>
  )
}
