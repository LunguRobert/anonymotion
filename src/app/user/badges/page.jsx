// src/app/user/badges/page.jsx
'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sparkles, Filter, X } from 'lucide-react'
import BadgeChip from '@/components/badges/BadgeChip'

/* ---------------------------------------------------------
   Utilities
--------------------------------------------------------- */
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
const TIERS = ['all', 'epic', 'rare', 'common']
const SCOPE_OPTS = [
  { key: 'all', label: 'All' },
  { key: 'journal', label: 'Journal' },
  { key: 'feed', label: 'Feed' },
]
const SORTS = [
  { key: 'earned', label: 'Earned first' },
  { key: 'tier', label: 'Tier (high to low)' },
  { key: 'az', label: 'A → Z' },
]

/* ---------------------------------------------------------
   Page
--------------------------------------------------------- */
export default function BadgesPage() {
  const [scope, setScope] = useState('all')
  const [tier, setTier] = useState('all')
  const [onlyEarned, setOnlyEarned] = useState(false)
  const [sortBy, setSortBy] = useState('earned')

  const [data, setData] = useState({ badges: [], top3: [], newlyEarned: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(`/api/user/badges?scope=${scope}`, { cache: 'no-store' })
        const json = await readJsonSafe(res)
        if (!alive) return
        setData({
          badges: Array.isArray(json.badges) ? json.badges : [],
          top3: Array.isArray(json.top3) ? json.top3 : [],
          newlyEarned: Array.isArray(json.newlyEarned) ? json.newlyEarned : [],
        })
      } catch (e) {
        if (!alive) return
        setError(e.message || 'Failed to load badges')
        setData({ badges: [], top3: [], newlyEarned: [] })
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [scope])

  const filtered = useMemo(() => {
    let list = [...(data.badges || [])]
    if (tier !== 'all') list = list.filter(b => (b.tier || '').toLowerCase() === tier)
    if (onlyEarned) list = list.filter(b => b.earned)
    // sorting
    list.sort((a, b) => {
      if (sortBy === 'tier') {
        const order = { epic: 3, rare: 2, common: 1 }
        return (order[(b.tier || '').toLowerCase()] || 0) - (order[(a.tier || '').toLowerCase()] || 0)
      }
      if (sortBy === 'az') {
        return String(a.label || '').localeCompare(String(b.label || ''))
      }
      // earned first (default)
      if (a.earned && !b.earned) return -1
      if (!a.earned && b.earned) return 1
      return String(a.label || '').localeCompare(String(b.label || ''))
    })
    return list
  }, [data.badges, tier, onlyEarned, sortBy])

  const total = data.badges?.length || 0
  const unlocked = (data.badges || []).filter(b => b.earned).length
  const prog = total ? Math.round((unlocked / total) * 100) : 0

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Your Badges</h1>
        <p className="mt-1 text-sm text-white/60">
          Track your progress and discover what's next to unlock.
        </p>
      </header>

      {/* Stats bar */}
      <section className="mb-6 rounded-3xl border border-white/10 bg-surface/80 p-4 sm:p-5 backdrop-blur">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Unlocked" value={`${unlocked}/${total}`} />
          <StatTile label="Completion" value={`${prog}%`}>
            <Progress value={prog} />
          </StatTile>
          <StatTile label="New this month" value={String((data.newlyEarned || []).length)} />
        </div>
      </section>

      {/* Toolbar */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Filters — no scroll, responsive grid */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
          <div className="w-full lg:w-auto">
            <Segmented fluid value={scope} onChange={setScope} options={SCOPE_OPTS} />
          </div>

          <div className="w-full sm:w-auto">
            <SelectMenu
              fluid
              icon={<Filter className="h-4 w-4" />}
              label="Tier"
              value={tier}
              onChange={setTier}
              options={TIERS.map(k => ({ key: k, label: k === 'all' ? 'All tiers' : k.charAt(0).toUpperCase() + k.slice(1) }))}
            />
          </div>

          <div className="w-full sm:w-auto">
            <SelectMenu
              fluid
              label="Sort"
              value={sortBy}
              onChange={setSortBy}
              options={SORTS}
            />
          </div>

          <div className="w-full sm:w-auto">
            <TogglePill
              fluid
              checked={onlyEarned}
              onChange={() => setOnlyEarned(v => !v)}
              label="Only earned"
            />
          </div>
        </div>


          {(tier !== 'all' || onlyEarned || sortBy !== 'earned') && (
            <button
              onClick={() => { setTier('all'); setOnlyEarned(false); setSortBy('earned') }}
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition"
            >
              <X className="h-3.5 w-3.5" /> Reset filters
            </button>
          )}
        </div>
      </section>

      {/* Newly earned */}
      {(data.newlyEarned || []).length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-white/90">
            <Sparkles className="h-4 w-4 text-pink-400" /> Newly earned
          </h2>
          <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-1">
            {data.newlyEarned.map(b => (
              <div
                key={`new-${b.code}`}
                className="snap-start rounded-2xl border border-white/10 bg-card/70 px-4 py-3 shadow-sm min-w-[240px]"
              >
                <div className="flex items-center justify-between">
                  <BadgeChip emoji={b.emoji} label={b.label} color={b.color} />
                  <TierPill tier={b.tier} />
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-white/70">{b.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top badges */}
      {(data.top3 || []).length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-white/90">Top badges</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {data.top3.map(b => (
              <TopBadgeCard key={`top-${b.code}`} badge={b} />
            ))}
          </div>
        </section>
      )}

      {/* Grid */}
      <section>
        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="rounded-2xl border border-white/10 bg-card p-4 text-center text-sm text-red-300">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onReset={() => { setTier('all'); setOnlyEarned(false); setSortBy('earned') }} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <BadgeCard key={b.code} badge={b} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

/* ---------------------------------------------------------
   Small building blocks
--------------------------------------------------------- */

function StatTile({ label, value, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-0.5 text-xl font-semibold text-white">{value}</div>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  )
}
function Progress({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

function Segmented({ value, onChange, options, fluid = false }) {
  return (
    <div className={`${fluid ? 'flex w-full' : 'inline-flex'} overflow-hidden rounded-full border border-white/10`}>
      {options.map((opt) => {
        const active = value === opt.key
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`${fluid ? 'flex-1 min-w-0' : ''} px-3 py-1.5 text-xs transition ${
              active ? 'bg-card text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
            aria-pressed={active}
          >
            <span className="block truncate">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function SelectMenu({ label, value, onChange, options, icon, fluid = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const current = options.find(o => o.key === value)?.label || label

  return (
    <div className={`${fluid ? 'w-full' : ''} relative`} ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition ${fluid ? 'w-full justify-between' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          {icon ? icon : null}
          <span className="text-white/80">{label}:</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium text-white/90">{current}</span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className={`absolute z-50 mt-2 rounded-2xl border border-white/10 bg-card p-1 shadow-xl ${fluid ? 'w-full' : 'w-44'}`}
            role="listbox"
          >
            {options.map((opt) => {
              const active = opt.key === value
              return (
                <div
                  key={opt.key}
                  role="option"
                  aria-selected={active}
                  onClick={() => { onChange(opt.key); setOpen(false) }}
                  className={`cursor-pointer rounded-xl px-3 py-2 text-sm text-white/90 hover:bg-white/5 ${active ? 'bg-white/5' : ''}`}
                >
                  {opt.label}
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TogglePill({ checked, onChange, label, fluid = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs transition border ${fluid ? 'w-full justify-between' : ''} ${
        checked
          ? 'border-pink-500/40 bg-pink-500/15 text-white'
          : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
      }`}
    >
      <span className={`h-3.5 w-3.5 rounded-full ${checked ? 'bg-pink-500 shadow-[0_0_0_2px_rgba(236,72,153,0.35)]' : 'bg-white/30'}`} />
      <span className="truncate">{label}</span>
    </button>
  )
}


function TierPill({ tier }) {
  const t = String(tier || '').toLowerCase()
  const map = {
    epic: 'from-fuchsia-500 to-pink-500',
    rare: 'from-sky-500 to-indigo-500',
    common: 'from-slate-400 to-slate-500',
  }
  const grad = map[t] || 'from-slate-400 to-slate-500'
  const label = t ? t.charAt(0).toUpperCase() + t.slice(1) : '—'
  return (
    <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${grad} px-2.5 py-0.5 text-[11px] font-medium text-white shadow-sm`}>
      {label}
    </span>
  )
}

/* ---------------------------------------------------------
   Cards
--------------------------------------------------------- */
function TopBadgeCard({ badge }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-4">
      <div className="flex items-center justify-between">
        <BadgeChip emoji={badge.emoji} label={badge.label} color={badge.color} />
        <TierPill tier={badge.tier} />
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-white/80">{badge.description}</p>
      <div className="mt-3 text-xs">
        {badge.earned ? (
          <span className="rounded-full bg-emerald-500/15 px-2 py-1 font-medium text-emerald-300">Unlocked</span>
        ) : (
          <span className="rounded-full bg-white/10 px-2 py-1 text-white/70">Locked</span>
        )}
      </div>
    </div>
  )
}

function BadgeCard({ badge }) {
  const locked = !badge.earned
  return (
    <div className={`rounded-2xl border p-4 transition ${locked ? 'border-white/10 bg-card/70 opacity-80' : 'border-white/10 bg-card'}`}>
      <div className="flex items-center justify-between">
        <BadgeChip emoji={badge.emoji} label={badge.label} color={badge.color} />
        <TierPill tier={badge.tier} />
      </div>

      <p className="mt-2 min-h-[40px] text-sm text-white/80">{badge.description}</p>

      {/* little meta row */}
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs ${locked ? 'text-white/60' : 'text-emerald-300'}`}>
          {locked ? 'Locked' : 'Unlocked'}
        </span>
        {typeof badge.progress === 'number' ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/60">Progress</span>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500" style={{ width: `${Math.min(100, Math.max(0, badge.progress))}%` }} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------
   Skeletons & Empty
--------------------------------------------------------- */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
      ))}
    </div>
  )
}

function EmptyState({ onReset }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-8 text-center">
      <p className="text-sm text-white/70">No badges match your filters.</p>
      <button
        onClick={onReset}
        className="mt-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
      >
        Reset filters
      </button>
    </div>
  )
}
