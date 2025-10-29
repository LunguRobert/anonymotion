'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Plus } from 'lucide-react'
import JournalTimeline from '@/components/journal/JournalTimeline'
import JournalEmptyState from '@/components/journal/JournalEmptyState'
import JournalModal from '@/components/journal/JournalModal'
import MoodHeatmap from '@/components/journal/MoodHeatmap'
import UnlockCard from '@/components/journal/UnlockCard'

const LIMIT = 10
const MOODS = ['HAPPY', 'SAD', 'ANGRY', 'ANXIOUS', 'NEUTRAL']

export default function JournalClient({ isPremium }) {
  const { data: session } = useSession()
  const [entries, setEntries] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const loadMoreRef = useRef(null)
  const [emotionFilter, setEmotionFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [locked, setLocked] = useState(false)
  const [ready, setReady] = useState(false)

  // mock pentru heatmap — înlocuiește cu date reale
  const mockMoodByDate = {
    '2025-07-02': 'HAPPY',
    '2025-07-03': 'SAD',
    '2025-07-04': 'ANGRY',
    '2025-07-05': 'HAPPY',
    '2025-07-06': 'ANXIOUS',
    '2025-07-07': 'NEUTRAL',
  }

  // Setează heatmap vizibil pe md+
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 768px)')
    setShowHeatmap(mq.matches)
    const handler = (e) => setShowHeatmap(e.matches)
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])

  // Verifică lock (dacă /api/journal răspunde 403)
  useEffect(() => {
    if (!session?.user?.id) return
    ;(async () => {
      try {
        const res = await fetch('/api/journal?limit=0', { cache: 'no-store' })
        if (res.status === 403) setLocked(true)
      } catch {}
      setReady(true)
    })()
  }, [session?.user?.id])

  async function fetchEntries({ initial = false } = {}) {
    if (isLoading) return
    setIsLoading(true)

    const url = new URL('/api/journal', window.location.origin)
    url.searchParams.set('limit', LIMIT)
    if (!initial && entries.length) {
      url.searchParams.set('cursor', entries[entries.length - 1].createdAt)
    }
    if (emotionFilter) url.searchParams.set('emotion', emotionFilter)
    if (searchQuery) url.searchParams.set('query', searchQuery)

    const res = await fetch(url.toString())
    if (res.status === 403) {
      setLocked(true)
      setIsLoading(false)
      return
    }
    if (!res.ok) {
      setIsLoading(false)
      return
    }

    const data = await res.json()
    if (data.entries.length < LIMIT) setHasMore(false)
    if (initial) setEntries(data.entries)
    else setEntries(prev => [...prev, ...data.entries])

    setIsLoading(false)
  }

  // (Re)load la schimbarea filtrelor / session
  useEffect(() => {
    if (!session?.user?.id) return
    setEntries([])
    setHasMore(true)
    fetchEntries({ initial: true })
  }, [session, emotionFilter, searchQuery])

  // Infinite scroll
  useEffect(() => {
    const node = loadMoreRef.current
    if (!node) return
    const obs = new IntersectionObserver(
      (ioEntries) => {
        if (ioEntries[0].isIntersecting && hasMore && !isLoading) {
          fetchEntries()
        }
      },
      { threshold: 0.2 }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [hasMore, isLoading, entries.length])

  // Página server a făcut deja redirect dacă nu e logat.
  if (!ready) {
    return (
      <main className="relative mx-auto max-w-5xl px-4 pb-16 pt-8">
        <p className="py-10 text-center text-muted">Loading…</p>
      </main>
    )
  }

  if (locked) {
    return (
      <main className="relative mx-auto max-w-5xl px-4 pb-16 pt-8">
        <UnlockCard
          onUnlocked={() => {
            setLocked(false)
            setEntries([])
            setHasMore(true)
            fetchEntries({ initial: true })
          }}
        />
      </main>
    )
  }

  return (
    <main className="relative mx-auto max-w-5xl px-4 pb-16 pt-8">
      {/* HEADER */}
      <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-6 sm:p-8 text-center">
        <div className="glow-lamp pointer-events-none absolute inset-0" />
        <div className="relative z-10">
          <h1 className="text-2xl font-semibold tracking-tight text-inverted sm:text-3xl">
            Your Journal
          </h1>
          <p className="mx-auto mt-1 hidden max-w-2xl text-sm text-muted sm:block">
            Capture thoughts, notice patterns, and track your mood over time.
          </p>

          {/* Filter + Search */}
          <div className="mt-4 flex flex-col items-center gap-3 relative">
            {/* 🔒 Lock vizual + CTA când nu e premium */}
            {!isPremium && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-surface/80 backdrop-blur-sm border border-secondary/40">
                <p className="mb-3 text-xs text-white/70">
                  Filters are available with <span className="font-medium text-white">Premium</span>.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition"
                >
                  Go Premium
                </Link>
              </div>
            )}

            {/* chips */}
            <div
              className={`no-scrollbar flex w-full max-w-full items-center gap-2 overflow-x-auto sm:justify-center py-[10px] px-0 transition-opacity ${
                !isPremium ? 'opacity-50 pointer-events-none select-none' : ''
              }`}
            >
              <button
                onClick={() => setEmotionFilter('')}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${
                  !emotionFilter ? 'border-secondary bg-card text-inverted' : 'border-secondary text-muted hover:bg-card'
                }`}
                aria-pressed={!emotionFilter}
              >
                All
              </button>
              {MOODS.map((m) => {
                const active = emotionFilter === m
                return (
                  <button
                    key={m}
                    onClick={() => setEmotionFilter(active ? '' : m)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${
                      active ? 'border-secondary bg-card text-inverted' : 'border-secondary text-muted hover:bg-card'
                    }`}
                    aria-pressed={active}
                  >
                    {m}
                  </button>
                )
              })}
            </div>

            {/* search */}
            <div
              className={`relative w-full max-w-md transition-opacity ${
                !isPremium ? 'opacity-50 pointer-events-none select-none' : ''
              }`}
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your entries…"
                className="w-full rounded-full border border-secondary bg-card px-8 py-2 text-sm text-inverted placeholder:text-muted focus:outline-none focus:ring-2 ring-primary"
              />
            </div>

            {/* heatmap toggle (mobile) */}
            <button
              onClick={() => setShowHeatmap((v) => !v)}
              className={`sm:hidden rounded-full border border-secondary px-3 py-1 text-xs text-inverted hover:bg-card transition ${
                !isPremium ? 'opacity-50 pointer-events-none select-none' : ''
              }`}
            >
              {showHeatmap ? 'Hide mood heatmap' : 'Show mood heatmap'}
            </button>
          </div>
        </div>
      </section>

      {/* HEATMAP */}
      {showHeatmap && (
        <section className="mt-6 rounded-3xl border border-secondary bg-card p-4 sm:p-6">
          <h2 className="text-inverted text-base font-semibold">Monthly mood heatmap</h2>
          <p className="text-xs text-muted mt-1">A quick glance at how you’ve been feeling.</p>
          <div className="mt-4">
            <MoodHeatmap moodByDate={mockMoodByDate} />
          </div>
        </section>
      )}

      {/* FAB (desktop) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-inverted shadow-lg transition hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New entry</span>
      </button>

      {/* TIMELINE / EMPTY */}
      <section className="mt-6">
        {entries.length === 0 ? (
          <div className="rounded-3xl border border-secondary bg-card p-6 text-center">
            <JournalEmptyState onClick={() => setOpen(true)} />
          </div>
        ) : (
          <>
            <JournalTimeline
              entries={entries}
              onEditEntry={(entry) => { setSelectedEntry(entry); setOpen(true) }}
            />
            <div ref={loadMoreRef} className="mt-6 h-8" />
            {isLoading && (
              <p className="animate-pulse py-2 text-center text-sm text-muted">Loading entries…</p>
            )}
          </>
        )}
      </section>

      {/* FAB (mobile simplu) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 rounded-full bg-primary px-5 py-3 text-sm text-inverted shadow-lg transition hover:opacity-90 sm:hidden"
        aria-label="Add journal entry"
      >
        New entry
      </button>

      {/* MODAL */}
      {open && (
        <JournalModal
          onClose={() => { setOpen(false); setSelectedEntry(null) }}
          onAdd={(newOrUpdated) => {
            setEntries((prev) => {
              const exists = prev.find(e => e.id === newOrUpdated.id)
              if (exists) return prev.map(e => e.id === newOrUpdated.id ? newOrUpdated : e)
              return [newOrUpdated, ...prev]
            })
          }}
          onDelete={(id) => setEntries((prev) => prev.filter(e => e.id !== id))}
          entryToEdit={selectedEntry}
        />
      )}
    </main>
  )
}
