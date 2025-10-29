// src/components/user/MyPosts.jsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Grid, List, Trash2, Filter, Download, Lock, ChevronDown, Calendar, X, MoreVertical, FileText } from 'lucide-react'
import Link from 'next/link'
import { reactionMap as reactionAssets } from '@/lib/reactions'

/* -------------------- helpers -------------------- */
function reactionsToString(reac) {
  const entries = Object.entries(reac || {})
  if (!entries.length) return '-'
  entries.sort((a, b) => b[1] - a[1])
  return entries.map(([k, v]) => `${k}:${v}`).join(' · ')
}

async function exportPDFVisible(items) {
  if (!items?.length) {
    alert('Nothing to export. Load some posts first.')
    return
  }
  try {
    const [{ jsPDF }, autoTableMod] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])
    const autoTable = autoTableMod.default

    // ---- Cache fonts (base64) so we fetch once per page load
    const cache = (window.__noto_cache ||= {})
    if (!cache.reg || !cache.bold) {
      const [regBuf, boldBuf] = await Promise.all([
        fetch('/fonts/NotoSans-Regular.ttf').then(r => r.arrayBuffer()),
        fetch('/fonts/NotoSans-Bold.ttf').then(r => r.arrayBuffer()),
      ])
      const toB64 = (buf) => {
        const bytes = new Uint8Array(buf)
        let bin = ''
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
        return btoa(bin)
      }
      cache.reg  = toB64(regBuf)
      cache.bold = toB64(boldBuf)
    }

    // ---- Create doc and register fonts on THIS instance
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
    doc.addFileToVFS('NotoSans-Regular.ttf', cache.reg)
    doc.addFileToVFS('NotoSans-Bold.ttf',    cache.bold)
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal')
    doc.addFont('NotoSans-Bold.ttf',    'NotoSans', 'bold')
    doc.setFont('NotoSans', 'normal')

    // ---- Helpers
    const EMO_COLORS = {
      HAPPY:   [250, 204,  21],
      NEUTRAL: [163, 163, 163],
      SAD:     [ 96, 165, 250],
      ANGRY:   [248, 113, 113],
      ANXIOUS: [192, 132, 252],
    }
    const safe = (s='') => String(s).replace(/\s+/g, ' ').trim()
    const words = (s='') => safe(s).split(/\s+/).filter(Boolean).length
    const cap = (s='') => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
    const human = (m='') => {
      const up = String(m).toUpperCase()
      return { HAPPY:'Happy', NEUTRAL:'Neutral', SAD:'Sad', ANGRY:'Angry', ANXIOUS:'Anxious' }[up] ?? cap(m)
    }
    const d2 = n => String(n).padStart(2,'0')
    const fmtDate = d => `${d.getFullYear()}-${d2(d.getMonth()+1)}-${d2(d.getDate())}`

    // Replace control chars and astral (emoji etc.) so PDF never breaks
    const toPDFSafe = (s='') =>
      String(s)
        .normalize('NFC')
        .replace(/[\u0000-\u001F\u007F]/g, ' ')
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '•')

    const dates = items.map(p => new Date(p.createdAt))
    const minD = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxD = new Date(Math.max(...dates.map(d => d.getTime())))
    const rangeLabel = `${fmtDate(minD)} to ${fmtDate(maxD)}`

    const emotionCounts = items.reduce((acc, p) => {
      const e = p.emotion || 'NEUTRAL'
      acc[e] = (acc[e] || 0) + 1
      return acc
    }, {})
    const topEmotion = Object.entries(emotionCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || 'NEUTRAL'
    const totalReactions = items.reduce((acc, p) => {
      const r = p.reactions || {}
      return acc + Object.values(r).reduce((a,b) => a + (b||0), 0)
    }, 0)
    const avgWords = Math.round(
      items.reduce((acc,p) => acc + words(p.content || ''), 0) / items.length
    )
    const postsPerDay = (() => {
      const m = new Map()
      for (const p of items) {
        const d = new Date(p.createdAt)
        const key = `${d.getFullYear()}-${d2(d.getMonth()+1)}-${d2(d.getDate())}`
        m.set(key, (m.get(key) || 0) + 1)
      }
      const last14 = [...Array(14)].map((_,i) => {
        const d = new Date(maxD); d.setDate(d.getDate() - (13 - i))
        const key = `${d.getFullYear()}-${d2(d.getMonth()+1)}-${d2(d.getDate())}`
        return m.get(key) || 0
      })
      return last14
    })()
    const reactionsToStringLocal = (reac = {}) => {
      const entries = Object.entries(reac || {})
      if (!entries.length) return '–'
      entries.sort((a,b) => b[1] - a[1])
      return entries.map(([k,v]) => `${k}:${v}`).join(' · ')
    }

    // ---- Layout
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const M = 40

    // Cover
    const headerH = 120
    doc.setFillColor(18, 24, 46);   doc.rect(0, 0, pageW, headerH, 'F')
    doc.setFillColor(245, 246, 250);doc.rect(0, headerH, pageW, pageH - headerH, 'F')

    // Title & subtitle
    doc.setTextColor(255,255,255)
    doc.setFont('NotoSans', 'bold'); doc.setFontSize(24)
    doc.text(toPDFSafe('My Posts — Export'), M, 56)
    doc.setFont('NotoSans', 'normal'); doc.setFontSize(11)
    doc.setTextColor(220,226,234)
    doc.text(toPDFSafe(`Range: ${rangeLabel}`), M, 78)

    // Insight chips
    const chipY = headerH + 30
    const chipPadX = 14
    const chips = [
      { label: 'Total posts', value: String(items.length) },
      { label: 'Top emotion', value: human(topEmotion) },
      { label: 'Total reactions', value: String(totalReactions) },
      { label: 'Avg. words/post', value: String(avgWords) },
    ]
    const chipW = (pageW - M*2 - 30) / 4
    chips.forEach((c, i) => {
      const x = M + i * (chipW + 10)
      doc.setFillColor(255,255,255); doc.setDrawColor(230,232,236)
      if (doc.roundedRect) doc.roundedRect(x, chipY, chipW, 54, 10, 10, 'FD')
      else doc.rect(x, chipY, chipW, 54, 'FD')
      doc.setTextColor(100,110,125); doc.setFont('NotoSans','normal'); doc.setFontSize(10)
      doc.text(toPDFSafe(c.label), x + chipPadX, chipY + 20)
      doc.setTextColor(22,28,45); doc.setFont('NotoSans','bold'); doc.setFontSize(16)
      doc.text(toPDFSafe(c.value), x + chipPadX, chipY + 40)
    })

    // Sparkline
    const sparkX = M, sparkY = chipY + 80, sparkW = pageW - M*2, sparkH = 56
    doc.setDrawColor(230,232,236)
    if (doc.roundedRect) doc.roundedRect(sparkX, sparkY, sparkW, sparkH, 10, 10, 'S')
    else doc.rect(sparkX, sparkY, sparkW, sparkH, 'S')
    const maxV = Math.max(1, ...postsPerDay)
    const stepX = sparkW / (postsPerDay.length - 1)
    doc.setDrawColor(99,102,241); doc.setLineWidth(1.4)
    postsPerDay.forEach((v, idx) => {
      const x = sparkX + idx * stepX
      const y = sparkY + sparkH - (v / maxV) * (sparkH - 14) - 7
      if (idx === 0) doc.moveTo(x, y); else doc.lineTo(x, y)
    })
    doc.stroke()

    // Section label
    doc.setTextColor(18,24,46); doc.setFont('NotoSans','bold'); doc.setFontSize(14)
    doc.text(toPDFSafe('Posts table'), M, sparkY + sparkH + 28)

    // Table rows
    const rows = items.map(p => ([
      new Date(p.createdAt).toLocaleString(),
      String(p.emotion || 'NEUTRAL'),
      toPDFSafe(safe(p.content || '').slice(0, 300)),
      toPDFSafe(reactionsToStringLocal(p.reactions)),
    ]))

    // AutoTable (with custom font)
    autoTable(doc, {
      startY: sparkY + sparkH + 40,
      head: [[ 'Date', 'Emotion', 'Excerpt', 'Reactions' ]],
      body: rows,
      theme: 'grid',
      styles: {
        font: 'NotoSans',
        fontStyle: 'normal',
        fontSize: 9,
        cellPadding: 6,
        lineColor: [236, 239, 244],
        lineWidth: 0.5,
        textColor: [22, 28, 45],
        halign: 'left',
        valign: 'middle',
      },
      headStyles: {
        font: 'NotoSans',
        fontStyle: 'bold',
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
      },
      bodyStyles: { fillColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 160 },
        1: { cellWidth: 120 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 180 },
      },
      margin: { left: M, right: M },

      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          data.cell.text = '' // we'll draw custom chip below
        }
        if (data.cell && Array.isArray(data.cell.text)) {
          data.cell.text = data.cell.text.map(t => toPDFSafe(t))
        }
      },

      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const moodRaw = String(rows[data.row.index][1] || 'NEUTRAL')
          const moodUp = moodRaw.toUpperCase()
          const moodLabel = human(moodUp)
          const [r,g,b] = EMO_COLORS[moodUp] || [163,163,163]
          const { x, y, height } = data.cell
          const cy = y + height / 2
          const cx = x + 12
          doc.setFillColor(r, g, b)
          doc.circle(cx, cy, 4, 'F')
          doc.setTextColor(22, 28, 45)
          doc.setFont('NotoSans', 'bold'); doc.setFontSize(9)
          doc.text(toPDFSafe(` ${moodLabel}`), cx + 6, cy + 3)
        }
      },

      didDrawPage: () => {
        const { pageNumber } = doc.internal.getCurrentPageInfo()
        if (pageNumber > 1) {
          doc.setFillColor(248, 250, 252)
          doc.rect(0, 0, pageW, 42, 'F')
          doc.setTextColor(30, 41, 59)
          doc.setFont('NotoSans', 'bold'); doc.setFontSize(12)
          doc.text(toPDFSafe('My Posts — Export'), M, 26)
          doc.setFont('NotoSans', 'normal'); doc.setFontSize(10)
          doc.setTextColor(71, 85, 105)
          doc.text(toPDFSafe(rangeLabel), M + 140, 26)
        }
        const str = `Page ${pageNumber}`
        doc.setFont('NotoSans', 'normal'); doc.setFontSize(9)
        doc.setTextColor(100, 116, 139)
        doc.text(str, pageW - M - doc.getTextWidth(str), pageH - 14)
      },
    })

    doc.save('my-posts-export.pdf')
  } catch (e) {
    console.error(e)
    alert(e.message || 'PDF export failed')
  }
}


function readJsonSafe(res) {
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    return res.text().then(t => { throw new Error(t || `Bad response (${res.status})`) })
  }
  return res.json().then(j => {
    if (!res.ok) throw new Error(j?.error || `Bad response (${res.status})`)
    return j
  })
}

function timeAgo(dateStr) {
  const d = new Date(dateStr)
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  return `${days}d ago`
}

const EMOTIONS = ['HAPPY', 'SAD', 'ANGRY', 'ANXIOUS', 'NEUTRAL']
const emotionGrad = {
  NEUTRAL: 'from-gray-600 via-gray-500 to-gray-400',
  HAPPY: 'from-yellow-400 via-pink-400 to-orange-400',
  SAD: 'from-blue-500 via-indigo-600 to-purple-700',
  ANGRY: 'from-red-600 via-orange-700 to-red-800',
  ANXIOUS: 'from-teal-500 via-purple-500 to-fuchsia-600',
}

// Date presets computed on client -> turned into from/to (YYYY-MM-DD)
const PRESETS = [
  { key: 'all', label: 'All time' },
  { key: '7', label: 'Last 7 days' },
  { key: '30', label: 'Last 30 days' },
  { key: 'year', label: 'This year' },
  { key: 'custom', label: 'Custom range' }, // Premium unlocks custom
]

function toISODateUTC(d) {
  // YYYY-MM-DD in UTC
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function computeRange(preset) {
  const now = new Date()
  switch (preset) {
    case '7': {
      const from = new Date(now); from.setUTCDate(from.getUTCDate() - 6)
      return { from: toISODateUTC(from), to: toISODateUTC(now) }
    }
    case '30': {
      const from = new Date(now); from.setUTCDate(from.getUTCDate() - 29)
      return { from: toISODateUTC(from), to: toISODateUTC(now) }
    }
    case 'year': {
      const from = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
      return { from: toISODateUTC(from), to: toISODateUTC(now) }
    }
    case 'all':
      return { from: '', to: '' }
    default:
      return { from: '', to: '' }
  }
}

function UpsellFreeCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <p className="text-xs text-white/80 leading-tight break-words">
          Advanced filters and exports are part of <span className="font-semibold text-white">Premium</span>.
        </p>
        <a
          href="/pricing"
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-pink-600 px-4 py-1.5 text-xs font-medium text-white shadow hover:bg-pink-700 transition"
        >
          Go Premium
        </a>
      </div>
    </div>
  )
}

/* -------------------- main component -------------------- */

export default function MyPosts({ isPremium }) {
  const [view, setView] = useState('board') // 'board' | 'list'
  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [query, setQuery] = useState('')
  const [emotion, setEmotion] = useState('')
  const [preset, setPreset] = useState('7') // default calm scope
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const [showUpsell, setShowUpsell] = useState(false)
  const [confirm, setConfirm] = useState({ open: false, id: null })

  const limit = 12
  const mounted = useRef(false)

  const effectiveRange = useMemo(() => {
    if (preset === 'custom') return { from, to }
    return computeRange(preset)
  }, [preset, from, to])

  async function load(reset = false, pageOverride = null) {

    try {
      setLoading(true)
      if (reset) {
        setError('')
      }
      const params = new URLSearchParams()
      const effectivePage = reset ? 0 : (pageOverride ?? page)
      params.set('page', String(effectivePage))

      params.set('limit', String(limit))
      if (query) params.set('q', query)
      if (emotion) params.set('emotion', emotion)

      const { from: f, to: t } = effectiveRange
      if (f) params.set('from', f)
      if (t) params.set('to', t)

      const res = await fetch(`/api/my/posts?${params.toString()}`, { cache: 'no-store' })
      const json = await readJsonSafe(res)

      if (reset) {
        setItems(json.items || [])
        setPage(0)
      } else {
        setItems(prev => {
          const merged = [...prev, ...(json.items || [])]
          const unique = Array.from(new Map(merged.map(p => [p.id, p])).values())
          return unique
        })
      }

      setHasMore(Boolean(json.hasMore))
      setError('')
    } catch (e) {
      setError(e.message || 'Failed to load your posts')
      if (reset) setItems([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // initial load
    load(true)
    mounted.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // re-load when filters change (debounced for search)
  useEffect(() => {
    if (!mounted.current) return
    const t = setTimeout(() => load(true), 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, emotion, preset, from, to])

  async function handleLoadMore() {
    if (!hasMore || loading) return
    const next = page + 1
    setPage(next)
    await load(false, next)
  }

  async function confirmDelete() {
    const id = confirm.id
    if (!id) return
    try {
      const res = await fetch(`/api/my/posts/${id}`, { method: 'DELETE' })
      const json = await readJsonSafe(res)
      if (json?.ok) {
        setItems(prev => prev.filter(p => p.id !== id))
        setConfirm({ open: false, id: null })
      }
    } catch (e) {
      alert(e.message || 'Failed to delete')
      setConfirm({ open: false, id: null })
    }
  }

  function exportCSV() {
    const headers = ['id', 'createdAt', 'emotion', 'content', 'reactions']
    const rows = items.map(p => {
      const reactions = Object.entries(p.reactions || {}).map(([k, v]) => `${k}:${v}`).join('|')
      const content = (p.content || '').replace(/\r?\n/g, ' ').replace(/"/g, '""')
      return [p.id, new Date(p.createdAt).toISOString(), p.emotion, `"${content}"`, `"${reactions}"`].join(',')
    })
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-posts.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  /* -------------------- UI subcomponents -------------------- */

// 🔄 Înlocuiește integral const Toolbar cu varianta de mai jos

// 🔄 Înlocuiește integral const Toolbar cu varianta de mai jos

const Toolbar = (
  <div className="w-full">
    {/* ===== Mobile (<sm) ===== */}
    <div className="sm:hidden flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <input
          type="search"
          placeholder="Search your posts…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-sm outline-none placeholder:text-white/40"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">⌘K</span>
      </div>

      {/* Premium: filtrele sub search (scroll orizontal + wrap mic) */}
      {isPremium ? (
        <>
          <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 py-1">
            <EmotionChip value={emotion} onChange={(val) => setEmotion(val)} />
            <DateRangeChip
              isPremium
              preset={preset}
              setPreset={setPreset}
              from={from}
              setFrom={setFrom}
              to={to}
              setTo={setTo}
              onUpsell={() => {}}
            />
          </div>

          {/* Active filter pills */}
          <ActiveFilters
            emotion={emotion}
            clearEmotion={() => setEmotion('')}
            preset={preset}
            from={from}
            to={to}
            clearCustom={() => { setPreset('7'); setFrom(''); setTo('') }}
          />
        </>
      ) : (
        // Free: mic card de upsell, fără filtre
        <UpsellFreeCard />
      )}

      {/* Actions row (view + export menu) */}
      <div className="mt-1 flex items-center gap-2">
        <SegmentedControl value={view} onChange={setView} size="sm" />
        <div className="ml-auto flex items-center gap-2">
          {isPremium ? (
            <MobileActionsMenu
              isPremium
              onExportCsv={exportCSV}
              onExportPdf={() => exportPDFVisible(items)}
              onUpsell={() => {}}
            />
          ) : null}
        </div>
      </div>
    </div>

    {/* ===== Desktop (sm+) ===== */}
    <div className="hidden sm:grid sm:grid-cols-[1fr,auto] sm:items-end sm:gap-4">
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <input
            type="search"
            placeholder="Search your posts…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-sm outline-none placeholder:text-white/40"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">⌘K</span>
        </div>

        {/* Filtre & range la Premium; upsell scurt la Free */}
        {isPremium ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <EmotionChip value={emotion} onChange={(val) => setEmotion(val)} />
              <DateRangeChip
                isPremium
                preset={preset}
                setPreset={setPreset}
                from={from}
                setFrom={setFrom}
                to={to}
                setTo={setTo}
                onUpsell={() => {}}
              />
              <ActiveFilters
                emotion={emotion}
                clearEmotion={() => setEmotion('')}
                preset={preset}
                from={from}
                to={to}
                clearCustom={() => { setPreset('7'); setFrom(''); setTo('') }}
              />
            </div>
          </>
        ) : (
          <UpsellFreeCard />
        )}
      </div>

      {/* Actions (dreapta) */}
      <div className="flex items-center justify-end gap-2">
        {isPremium ? (
          <>
            <button
              onClick={() => exportPDFVisible(items)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 transition"
              title="Export PDF"
            >
              <FileText className="h-4 w-4" /> Export PDF
            </button>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 transition"
              title="Export CSV"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </>
        ) : null}
        <SegmentedControl value={view} onChange={setView} />
      </div>
    </div>
  </div>
)


 

  return (
    <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-6 sm:p-8">
      <div className="glow-lamp absolute inset-0" />
      <div className="relative z-10">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-inverted">My Posts</h1>
          <p className="text-sm text-muted mt-1">A calm, searchable library of your reflections.</p>
        </header>

        {Toolbar}

        {/* Upsell banner */}
        {showUpsell && (
          <div className="mt-3 rounded-xl border border-white/10 bg-gradient-to-r from-fuchsia-600/20 to-pink-600/20 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-white/90">
                Unlock advanced filters and CSV export with <span className="font-semibold">Premium</span>.
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="/pricing"
                  className="rounded-full bg-pink-600 px-4 py-1.5 text-sm font-medium text-white shadow hover:bg-pink-700 transition"
                >
                  Upgrade
                </a>
                <button
                  onClick={() => setShowUpsell(false)}
                  className="rounded-full border border-white/15 bg-white/5 p-2 text-white/70 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-secondary bg-card p-4 text-center">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Views */}
        {view === 'board' ? (
        <BoardGrid
            items={items}
            loading={loading}
            onDelete={(id) => setConfirm({ open: true, id })}
        />
        ) : (
        <ListView
            items={items}
            loading={loading}
            onDelete={(id) => setConfirm({ open: true, id })}
        />
        )}

        {/* Load more */}
        <div className="mt-6 flex items-center justify-center">
          {loading && items.length === 0 ? (
            <div className="w-full max-w-3xl space-y-3">
              <div className="h-24 rounded-2xl bg-white/10 animate-pulse" />
              <div className="h-24 rounded-2xl bg-white/10 animate-pulse" />
              <div className="h-24 rounded-2xl bg-white/10 animate-pulse" />
            </div>
          ) : hasMore ? (
            <button
              onClick={handleLoadMore}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white hover:bg-white/10 transition"
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Load more'}
            </button>
          ) : (
            <p className="text-xs text-muted">You’ve reached the end.</p>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirm.open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl border border-white/15 bg-card p-6"
              initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 14, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-inverted">Delete post?</h3>
              <p className="mt-1 text-sm text-white/70">
                This action cannot be undone.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={() => setConfirm({ open: false, id: null })}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700 transition"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/* -------------------- UI building blocks -------------------- */

function SegmentedControl({ value, onChange, size = 'md' }) {
  const pad = size === 'sm' ? 'px-2 py-1' : 'px-3 py-2'
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <div className="inline-flex overflow-hidden rounded-full border border-white/10">
      <button
        onClick={() => onChange('board')}
        className={`${pad} text-sm ${value === 'board' ? 'bg-card text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
        title="Board view"
      >
        <Grid className={icon} />
      </button>
      <button
        onClick={() => onChange('list')}
        className={`${pad} text-sm ${value === 'list' ? 'bg-card text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
        title="List view"
      >
        <List className={icon} />
      </button>
    </div>
  )
}

function MobileActionsMenu({ isPremium, onExportCsv, onExportPdf, onUpsell }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="rounded-full border border-white/15 bg-white/5 p-2 text-white hover:bg-white/10 transition"
        aria-label="More actions"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute right-0 z-50 mt-2 w-44 rounded-2xl border border-white/10 bg-card p-1 shadow-lg"
          >
            {isPremium ? (
              <>
                <button
                  onClick={() => { setOpen(false); onExportPdf?.() }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-left hover:bg-white/5"
                >
                  <FileText className="h-4 w-4" /> Export PDF
                </button>
                <button
                  onClick={() => { setOpen(false); onExportCsv?.() }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-left hover:bg-white/5"
                >
                  <Download className="h-4 w-4" /> Export CSV
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setOpen(false); onUpsell?.() }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-left hover:bg-white/5 text-white/80"
                >
                  <Lock className="h-4 w-4" /> Export PDF (Premium)
                </button>
                <button
                  onClick={() => { setOpen(false); onUpsell?.() }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-left hover:bg-white/5 text-white/80"
                >
                  <Lock className="h-4 w-4" /> Export CSV (Premium)
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


function DateRangeChip({ isPremium, preset, setPreset, from, setFrom, to, setTo, onUpsell }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const label = (PRESETS.find(p => p.key === preset)?.label) || 'Custom'

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white hover:bg-white/10 transition"
      >
        <Calendar className="h-4 w-4" />
        <span>Date range: {label}</span>
        <ChevronDown className="h-4 w-4 opacity-60" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute z-50 mt-2 w-56 rounded-2xl border border-white/10 bg-card p-2 shadow-lg"
          >
            {PRESETS.map(p => {
              const locked = !isPremium && (p.key === 'custom' || p.key === 'year' || p.key === '30')
              return (
                <button
                  key={p.key}
                  onClick={() => {
                    if (locked) { onUpsell?.(); return }
                    setPreset(p.key)
                    if (p.key !== 'custom') setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-left hover:bg-white/5 ${
                    preset === p.key ? 'bg-white/5' : ''
                  } ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span>{p.label}</span>
                  {locked && <Lock className="h-4 w-4" />}
                </button>
              )
            })}

            {/* Custom range inputs — only when premium + selected */}
            {isPremium && preset === 'custom' && (
              <div className="mt-2 space-y-2 rounded-xl border border-white/10 p-2">
                <div className="text-[11px] text-white/60">Custom range</div>
                <input
                  type="date"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                />
                <input
                  type="date"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => { setFrom(''); setTo(''); }}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-pink-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-pink-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DateRangeMenu({ isPremium, preset, setPreset, from, to, onChangeFrom, onChangeTo }) {
  const [open, setOpen] = useState(false)
  // close on outside click
  useEffect(() => {
    function onDoc(e) {
      if (!(e.target.closest && e.target.closest('[data-range-root]'))) setOpen(false)
    }
    if (open) document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [open])

  return (
    <div className="relative inline-block" data-range-root>
      <button
        onClick={() => setOpen(v => !v)}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute z-50 mt-2 w-56 rounded-2xl border border-white/10 bg-card p-2 shadow-lg"
          >
            {PRESETS.map(p => {
              const locked = !isPremium && (p.key === 'custom' || p.key === 'year' || p.key === '30')
              return (
                <button
                  key={p.key}
                  onClick={() => {
                    if (locked) return
                    setPreset(p.key)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-left hover:bg-white/5 ${preset === p.key ? 'bg-white/5' : ''} ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span>{p.label}</span>
                  {locked && <Lock className="h-4 w-4" />}
                </button>
              )
            })}

            {/* Custom range inputs — only when premium + selected */}
            {isPremium && preset === 'custom' && (
              <div className="mt-2 space-y-2 rounded-xl border border-white/10 p-2">
                <div className="text-[11px] text-white/60">Custom range</div>
                <input
                  type="date"
                  value={from}
                  onChange={e => onChangeFrom(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                />
                <input
                  type="date"
                  value={to}
                  onChange={e => onChangeTo(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ActiveFilters({ emotion, clearEmotion, preset, from, to, clearCustom }) {
  const chips = []
  if (emotion) chips.push({ label: `Emotion: ${emotion}`, onClear: clearEmotion })
  if (preset === 'custom' && (from || to)) chips.push({ label: `Custom: ${from || '…'} → ${to || '…'}`, onClear: clearCustom })
  if (!chips.length) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c, i) => (
        <span key={i} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs">
          {c.label}
          <button onClick={c.onClear} className="ml-1 rounded-full p-1 hover:bg-white/10">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  )
}

/* -------------------- views -------------------- */

function BoardGrid({ items, loading, onDelete }) {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {loading && items.length === 0
        ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 rounded-2xl bg-white/10 animate-pulse" />)
        : items.length === 0
          ? <p className="text-sm text-muted">No posts found.</p>
          : (
            <AnimatePresence initial={false}>
              {items.map(p => (
                <motion.article
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="relative rounded-2xl border border-secondary bg-card"
                >
                  {/* colored spine */}
                  <div className="absolute inset-y-0 left-0 w-1.5 rounded-l-2xl bg-gradient-to-b from-white/10 to-white/20" />
                  <div className="p-4">
                    <div className={`rounded-xl bg-gradient-to-br ${emotionGrad[p.emotion] || 'from-slate-600 to-slate-800'} p-4 text-white`}>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="rounded-full bg-black/25 px-2 py-0.5">#{p.emotion}</span>
                        <span className="opacity-80">{timeAgo(p.createdAt)}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed line-clamp-8">{p.content}</p>
                    </div>

                    {/* reactions row */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 justify-center">
                      {(reactionAssets[p.emotion] || []).map(({ name, file }) => {
                        const count = p.reactions?.[name] || 0
                        return (
                          <div key={name} className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={file} alt={`${name} reaction`} className="h-7 w-7 object-contain opacity-80" />
                            {count > 0 && (
                              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-muted">{count}</span>
                            )}
                          </div>
                        )
                      })}
                      {Object.keys(p.reactions || {}).length === 0 && (
                        <span className="text-xs text-muted italic">No reactions</span>
                      )}
                    </div>

                    {/* actions */}
                    <div className="mt-4 flex items-center justify-center">
                    <button
                        onClick={() => onDelete(p.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" /> Delete
                    </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          )
      }
    </div>
  )
}

function EmotionChip({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const dot = {
    HAPPY: 'bg-yellow-400',
    SAD: 'bg-blue-400',
    ANGRY: 'bg-red-500',
    ANXIOUS: 'bg-fuchsia-500',
    NEUTRAL: 'bg-gray-400',
  }
  const currentLabel = value || 'All emotions'

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Shell (nu e button) cu 2 butoane surori înăuntru */}
      <div className="inline-flex items-center overflow-hidden rounded-full border border-white/10 bg-white/5">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="inline-flex items-center gap-2 px-3 py-1 text-xs text-white hover:bg-white/10 transition"
          aria-haspopup="menu"
          aria-expanded={open ? 'true' : 'false'}
        >
          {value ? (
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot[value] || 'bg-white/50'}`} />
          ) : (
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-white/40" />
          )}
          <span>{currentLabel}</span>
          <ChevronDown className="h-4 w-4 opacity-60" aria-hidden="true" />
        </button>

        {/* Clear — buton separat, nu mai este descendent al altui button */}
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="ml-1 mr-1 rounded-full p-1 text-white/80 hover:bg-white/10"
            title="Clear emotion filter"
            aria-label="Clear emotion filter"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute z-50 mt-2 w-48 rounded-2xl border border-white/10 bg-card p-2 shadow-lg"
            role="menu"
            aria-label="Select emotion"
          >
            {/* All emotions */}
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-left hover:bg-white/5 ${!value ? 'bg-white/5' : ''}`}
              role="menuitem"
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-white/40" />
              <span>All emotions</span>
            </button>

            <div className="my-1 h-px bg-white/10" />

            {/* Lista emoții */}
            {EMOTIONS.map(m => (
              <button
                type="button"
                key={m}
                onClick={() => { onChange(m); setOpen(false) }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-left hover:bg-white/5 ${value === m ? 'bg-white/5' : ''}`}
                role="menuitemradio"
                aria-checked={value === m}
              >
                <span className="inline-flex items-center gap-2">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot[m] || 'bg-white/40'}`} />
                  {m}
                </span>
                {value === m ? <span className="text-xs text-white/70">Selected</span> : null}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


function ListView({ items, loading, onDelete }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-secondary bg-card">
      <div className="grid grid-cols-[140px,120px,1fr,160px,120px] items-center gap-3 border-b border-white/10 px-4 py-3 text-xs text-white/70">
        <div>Date</div>
        <div>Emotion</div>
        <div>Excerpt</div>
        <div>Reactions</div>
        <div className="text-right">Actions</div>
      </div>

      {loading && items.length === 0 && (
        <div className="p-4">
          <div className="h-12 rounded-xl bg-white/10 animate-pulse mb-2" />
          <div className="h-12 rounded-xl bg-white/10 animate-pulse mb-2" />
          <div className="h-12 rounded-xl bg-white/10 animate-pulse" />
        </div>
      )}

      {(!loading && items.length === 0) ? (
        <div className="p-6 text-sm text-muted">No posts found.</div>
      ) : (
        <div className="divide-y divide-white/10">
          {items.map(p => (
            <div key={p.id} className="grid grid-cols-[140px,120px,1fr,160px,120px] items-center gap-3 px-4 py-3">
              <div className="text-xs text-white/70">{new Date(p.createdAt).toLocaleString()}</div>
              <div>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{p.emotion}</span>
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm text-inverted whitespace-pre-wrap">{p.content}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(reactionAssets[p.emotion] || []).map(({ name, file }) => {
                  const count = p.reactions?.[name] || 0
                  return (
                    <span key={name} className="inline-flex items-center gap-1 text-xs text-white/70">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={file} alt="" className="h-4 w-4 object-contain opacity-80" /> {count}
                    </span>
                  )
                })}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => onOpen(p.id)}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition"
                >
                  Open
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
