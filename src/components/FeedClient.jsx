'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import PostCard from './PostCard'
import PostForm from './PostForm'
import PostFilter from './PostFilter'
import ReportModal from './ReportModal'
import ComposeFAB from './ComposeFAB'

const LIMIT = 9

export default function FeedClient() {
  const [posts, setPosts] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState('')
  const [error, setError] = useState('')
  const [reportingPostId, setReportingPostId] = useState(null)
  const [isPremium, setIsPremium] = useState(false)
  const [planReady, setPlanReady] = useState(false)

    // 🔔 efecte vizuale pe reacții (per postId & tip)
  const [fx, setFx] = useState({})
  const fxTimersRef = useRef(new Map())
  const scrollRef = useRef(null)

  const trayRef = useRef(null)
  const [trayHeight, setTrayHeight] = useState(0)

  // ——— SkylineHeader state ———
  const [filtersOpen, setFiltersOpen] = useState(false) // tray-ul de filtre
  const [hideBar, setHideBar] = useState(false)         // ascunde bara când derulezi în jos
  const [scrollPct, setScrollPct] = useState(0)         // progres derulare (0..1)
  const lastYRef = useRef(0)

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }

  async function fetchPosts({ initial = false } = {}) {
    const before = posts.length ? posts[0].createdAt : null
    const url = new URL('/api/posts', window.location.origin)
    url.searchParams.set('limit', LIMIT)
    if (before) url.searchParams.set('before', before)
    if (filter) url.searchParams.set('emotion', filter)

    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()

    if (data.length < LIMIT) setHasMore(false)

    setPosts(prev => {
      const merged = [...data, ...prev]
      const unique = Array.from(new Map(merged.map(p => [p.id, p])).values())
      unique.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // ASC
      return unique
    })

    if (initial) setTimeout(scrollToBottom, 100)
  }

  // reset when filter changes
  useEffect(() => {
    setHasMore(true)
    setPosts([])
    fetchPosts({ initial: true })
  }, [filter])

  // lock body scroll (use internal scroller)
  useEffect(() => {
    document.body.classList.add('overflow-hidden', 'h-[100dvh]')
    return () => document.body.classList.remove('overflow-hidden', 'h-[100dvh]')
  }, [])

  // fetch premium plan
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/me/plan', { cache: 'no-store' })
        const j = await res.json().catch(() => ({}))
        if (!alive) return
        setIsPremium(j?.plan === 'PREMIUM')
      } catch {
        // în caz de eroare, tratăm ca FREE
        setIsPremium(false)
      } finally {
        if (alive) setPlanReady(true)
      }
    })()
    return () => { alive = false }
  }, [])


  // 🔴 NEW: ascultă SSE și adaugă în listă live
  useEffect(() => {
    const es = new EventSource('/api/posts/stream')

    const onNew = async (e) => {
      try {
        const { post } = JSON.parse(e.data)

        // dacă avem filtru activ, ignoră postările care nu se potrivesc
        if (filter && post?.emotion !== filter) return

        // luăm varianta „completă” (include reactions), ca în GET-ul tău
        const url = new URL('/api/posts', window.location.origin)
        url.searchParams.set('limit', '1')
        if (filter) url.searchParams.set('emotion', filter)

        const res = await fetch(url.toString(), { cache: 'no-store' })
        if (!res.ok) return
        const arr = await res.json()
        if (!Array.isArray(arr) || !arr.length) return
        const newest = arr[0]

        setPosts(prev => {
          const merged = [...prev, newest]
          const unique = Array.from(new Map(merged.map(p => [p.id, p])).values())
          unique.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          return unique
        })

        setTimeout(scrollToBottom, 80)
      } catch { /* noop */ }
    }

    // 🟣 NOU: handler pentru reacții live
    const onReaction = (e) => {
      try {
        const { postId, type, userId, op } = JSON.parse(e.data || '{}')
        if (!postId || !type || !op) return

        // 1) patch doar dacă postarea e în lista curentă
        setPosts(prev => {
          const idx = prev.findIndex(p => p.id === postId)
          if (idx === -1) return prev // nu e vizibilă → ignoră

          const post = prev[idx]
          const list = Array.isArray(post.reactions) ? post.reactions.slice() : []

          if (op === 'add') {
            if (!list.some(r => r.userId === userId && r.type === type)) {
              list.push({ id: `tmp_${userId}_${type}`, userId, type, postId })
            }
          } else if (op === 'remove') {
            const n = list.filter(r => !(r.userId === userId && r.type === type))
            list.length = 0; list.push(...n)
          }

          const next = prev.slice()
          next[idx] = { ...post, reactions: list, __flash: Date.now() } // marcăm pt highlight pe card
          return next
        })

        // 2) declanșează efect vizual pe butonul de reacții (pop + bulă)
        const key = `${type}_${Date.now()}`
        setFx(prev => ({
          ...prev,
          [postId]: { ...(prev[postId] || {}), [type]: { key, op } }
        }))

        // 3) cleanup efect după ~700ms
        const id = `${postId}:${type}`
        clearTimeout(fxTimersRef.current.get(id))
        const t = setTimeout(() => {
          setFx(prev => {
            const entry = { ...(prev[postId] || {}) }
            if (entry[type]?.key === key) delete entry[type]
            const next = { ...prev }
            if (Object.keys(entry).length) next[postId] = entry
            else delete next[postId]
            return next
          })
        }, 700)
        fxTimersRef.current.set(id, t)
      } catch { /* noop */ }
    }

    es.addEventListener('newPost', onNew)
    es.addEventListener('reaction', onReaction)
    es.onerror = () => { /* opțional: log/reconnect */ }

    return () => {
      es.removeEventListener('newPost', onNew)
      es.removeEventListener('reaction', onReaction)
      es.close()
      // curățăm timerele de efect
      for (const t of fxTimersRef.current.values()) clearTimeout(t)
      fxTimersRef.current.clear()
    }
  }, [filter])

  // SkylineHeader: ascunde la scroll în jos, arată la scroll în sus; calculează progres + închide tray
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const y = el.scrollTop
      const max = Math.max(1, el.scrollHeight - el.clientHeight)
      setScrollPct(Math.min(1, Math.max(0, y / max)))

      const dirDown = y > lastYRef.current
      if (y < 16) {
        setHideBar(false)
      } else {
        setHideBar(dirDown)
        if (dirDown && filtersOpen) setFiltersOpen(false) // ← închide tray când mergi în jos
      }
      lastYRef.current = y
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [filtersOpen])

  // Recalc tray height când se deschide / când se schimbă layout-ul interior
  useEffect(() => {
    const el = trayRef.current
    if (!el) return
    // scrollHeight nu depinde de height: 0, deci putem măsura și când e închis
    const measure = () => setTrayHeight(el.scrollHeight)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [filtersOpen, filter])


  // Shortcut pentru filtre: „F” sau „/”
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'f' || e.key === '/') {
        e.preventDefault()
        if (isPremium) setFiltersOpen(v => !v)
        else setFiltersOpen(true) // deschidem ca să arătăm overlay-ul de upsell
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPremium])

  const handlePosted = async () => {
    const res = await fetch('/api/posts?limit=1', { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    if (!data.length) return
    const newPost = data[0]
    setPosts(prev => {
      const merged = [...prev, newPost]
      const unique = Array.from(new Map(merged.map(p => [p.id, p])).values())
      unique.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      return unique
    })
    setTimeout(scrollToBottom, 100)
  }

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col pt-[57px] md:pt-[65px]">
    {/* SKYLINE HEADER — slim, sticky, collapsible */}
    <header
      className={`relative z-20 transition-transform duration-300 ${hideBar ? '-translate-y-full h-0 overflow-hidden pointer-events-none' : 'translate-y-0'}`}
      aria-label="Feed header"
    >
      <div className="border-b border-white/10 bg-[color-mix(in_lch,var(--color-background),transparent_30%)] backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_lch,var(--color-background),transparent_40%)]">
        {/* top row */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* brand micro + live pulse */}
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/20 shrink-0">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-inverted select-none">
              Emotional Galaxy
            </span>

            {/* active filter chip — now visible on mobile, truncated */}
            {filter && (
              <span
                className="
                  ml-2 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5
                  text-[11px] text-white/80 truncate max-w-[9.5rem] sm:max-w-none
                "
                title={`#${filter}`}
              >
                #{filter}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* toggle filters */}
            <button
              onClick={() => setFiltersOpen(v => !v)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                isPremium
                  ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                  : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
              }`}
              aria-expanded={filtersOpen ? 'true' : 'false'}
              aria-controls="filter-tray"
              title={isPremium ? 'Filters (F)' : 'Filters (Premium)'}
            >
              Filters{!isPremium ? ' (Premium)' : ''} <span className="ml-1 hidden md:inline text-white/50">• press F</span>
            </button>
          </div>
        </div>

        {/* collapsible filter tray — measured height */}
        <div
          id="filter-tray"
          aria-hidden={filtersOpen ? 'false' : 'true'}
          className="overflow-hidden transition-[height] duration-300"
          style={{ height: filtersOpen ? `${trayHeight}px` : '0px' }}
          ref={trayRef}
        >
          <div className="relative px-3 pb-3">
            {/* Conținutul real al filtrelor — dezactivat vizual & funcțional la FREE */}
            <div className={`${!isPremium ? 'pointer-events-none opacity-50 select-none' : ''}`}>
              <PostFilter filter={filter} setFilter={setFilter} setPosts={setPosts} />
            </div>

            {/* Overlay de upsell pentru FREE */}
            {!isPremium && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-surface/85 backdrop-blur-sm border border-white/10">
                <div className="text-center">
                  <p className="text-xs text-white/80">
                    Filters are a <span className="font-semibold text-white">Premium</span> feature.
                  </p>
                  <a
                    href="/pricing"
                    className="mt-2 inline-flex items-center justify-center rounded-full bg-pink-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-pink-700 transition"
                  >
                    Go Premium
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* starglow progress */}
        <div className="relative h-[2px]">
          <div className="absolute inset-0 bg-white/5" />
          <div
            className="h-full origin-left bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-violet-500 transition-[width] duration-150"
            style={{ width: `${Math.round(scrollPct * 100)}%` }}
            aria-hidden
          />
        </div>
      </div>
    </header>



      {/* FEED */}
      <section
        ref={scrollRef}
        className="custom-scrollbar mb-[20px] flex-1 overflow-y-auto px-2 pb-5 pt-1"
        aria-label="Feed"
      >
        {/* LOAD MORE */}
        {hasMore && (
          <div className="mb-3 mt-1 text-center">
            <button
              onClick={() => fetchPosts()}
              className="rounded-full border border-secondary px-4 py-1.5 text-sm text-inverted transition hover:bg-card"
            >
              ↑ Load older posts
            </button>
          </div>
        )}

        {/* GRID */}
        {posts.length === 0 ? (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-secondary bg-card p-6 text-center">
            <h2 className="font-semibold text-inverted">No posts yet</h2>
            <p className="mt-2 text-sm text-muted">Be the first to share something today.</p>
          </div>
        ) : (
          <div
            className="
              grid gap-6 px-1
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              mb-[65px]
            "
          >
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <PostCard post={post} fx={fx[post.id]} onReport={() => setReportingPostId(post.id)} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* COMPOSE */}
      <div className="sticky bottom-0 z-10 w-full bg-gradient-to-t from-[var(--color-background)] via-[color-mix(in_lch,var(--color-background),transparent_30%)] to-transparent px-4 py-3">
        <div className="hidden sm:block">
          <PostForm onPost={handlePosted} setError={setError} />
        </div>
        {/* Mobile FAB */}
        <ComposeFAB onPosted={handlePosted} setError={setError} />
        {error && <div className="mt-2 text-center text-sm text-danger">{error}</div>}
      </div>

      {/* REPORT MODAL */}
      {reportingPostId && (
        <ReportModal postId={reportingPostId} onClose={() => setReportingPostId(null)} />
      )}
    </div>
  )
}
