// components/PostForm.jsx
'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

/** Simple countdown hook to a UNIX ms timestamp. */
function useCountdown(targetMs, clockOffsetMs = 0) {
  const [now, setNow] = useState(() => Date.now())
  const timer = useRef(null)

  useEffect(() => {
    if (!targetMs) return
    const tick = () => setNow(Date.now())
    timer.current = window.setInterval(tick, 250)
    return () => { if (timer.current) window.clearInterval(timer.current) }
  }, [targetMs])

  const remaining = useMemo(() => {
    if (!targetMs) return 0
    // Ajustează „acum” cu offset-ul față de server (serverNow - clientNow)
    const adjustedNow = now + (clockOffsetMs || 0)
    return Math.max(0, targetMs - adjustedNow)
  }, [targetMs, now, clockOffsetMs])

  // Floor pentru 04:59 imediat după 429
  const seconds = Math.max(0, Math.floor(remaining / 1000))
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return { remainingMs: remaining, seconds, label: `${mm}:${ss}` }
}


/** Parse retry timestamp from a 429 response (headers/body). */
function parseRateLimit(res, body, serverClockSkewMs = 0) {
  const candidates = []

  // --- 1) Retry-After (sec): durată relativă
  const ra = res.headers.get('Retry-After')
  if (ra && /^\d+$/.test(ra)) {
    const secs = parseInt(ra, 10)
    // Ancorează pe ceasul clientului (evită skew server/client).
    candidates.push((Date.now() + serverClockSkewMs) + secs * 1000)

  }

  // --- 2) X-RateLimit-Reset / ...Reset-At (timp absolut)
  const resetHeader =
    res.headers.get('X-RateLimit-Reset') ||
    res.headers.get('X-RateLimit-Reset-At') ||
    res.headers.get('RateLimit-Reset')

  if (resetHeader) {
    let ts
    if (/^\d+$/.test(resetHeader)) {
      const num = parseInt(resetHeader, 10)
      // < 1e12 => UNIX sec; altfel ms
      ts = num < 1e12 ? num * 1000 : num
    } else {
      ts = Date.parse(resetHeader)
    }
    if (!Number.isNaN(ts)) candidates.push(ts)
  }

  // --- 3) Body hints (fallback)
  const nextAt = body?.nextAllowedAt || body?.retryAt || body?.resetAt
  if (nextAt != null) {
    let ts
    if (typeof nextAt === 'number') {
      ts = nextAt < 1e12 ? nextAt * 1000 : nextAt
    } else if (/^\d+$/.test(nextAt)) {
      const num = parseInt(nextAt, 10)
      ts = num < 1e12 ? num * 1000 : num
    } else {
      ts = Date.parse(nextAt)
    }
    if (!Number.isNaN(ts)) candidates.push(ts)
  }

  if (candidates.length) {
    // Alege cea mai mare țintă: evită „săritul” înapoi dacă headerele sunt ușor divergente
    return Math.max(...candidates)
  }

  // --- 4) Fallback: 5 minute de siguranță
  return Date.now() + 5 * 60 * 1000
}


export default function PostForm({ onPost, setError }) {
  const [content, setContent] = useState('')
  const [emotion, setEmotion] = useState('')
  const [retryAt, setRetryAt] = useState(null)
  const [clockOffsetMs, setClockOffsetMs] = useState(0)

  const { label: cooldownLabel, seconds: cooldownSeconds } = useCountdown(retryAt, clockOffsetMs)
  const canPost = !retryAt || cooldownSeconds <= 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return setError('Your thought is empty.')
    if (!emotion) return setError('Select an emotion.')
    if (!canPost) return // block early during cooldown

    const res = await fetch('/api/posts', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, emotion })
    })

    if (res.ok) {
      setContent('')
      setEmotion('')
      setError('')
      setRetryAt(null)
      setClockOffsetMs(0)
      onPost?.()
    } else {
      if (res.status === 429) {
        const body = await res.json().catch(() => ({}))
        const dateHeader = res.headers.get('Date')
        const serverClockSkewMs = dateHeader ? (new Date(dateHeader).getTime() - Date.now()) : 0
        setClockOffsetMs(serverClockSkewMs)

        const until = parseRateLimit(res, body, serverClockSkewMs)
        setRetryAt(until)
      }
      else {
        let msg = 'Something went wrong. Please try again.'
        try {
          const body = await res.json()
          if (body?.error) msg = body.error
        } catch {}
        setError(msg)
      }
    }
  }

  const emotionOptions = [
    { label: 'ANXIOUS', file: '/emotions/anxious.webp' },
    { label: 'NEUTRAL', file: '/emotions/neutral.webp' },
    { label: 'HAPPY',   file: '/emotions/happy.webp' },
    { label: 'ANGRY',   file: '/emotions/angry.webp' },
    { label: 'SAD',     file: '/emotions/sad.webp' },
  ]

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-3 text-center">
      {/* Top popup during cooldown (the only timer display) */}
      {!canPost && (
        <div
          role="status"
          aria-live="polite"
          className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800"
        >
          <div className="text-xs opacity-80">You can post again in</div>
          <div className="text-2xl font-bold tabular-nums">{cooldownLabel}</div>
          <div className="text-[11px] opacity-70">Limit: 1 post every 5 minutes</div>
        </div>
      )}

      {/* Emotion picker */}
      <div className="flex justify-center gap-3">
        {emotionOptions.map(({ label, file }) => (
          <button
            type="button"
            key={label}
            onClick={() => setEmotion(label)}
            className={`rounded-full p-1 transition hover:scale-110 ${
              emotion === label ? 'ring-2 ring-primary' : 'opacity-70'
            }`}
            title={label}
            aria-pressed={emotion === label}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={file} alt={`${label} icon`} className="h-9 w-9 object-contain" />
          </button>
        ))}
      </div>

      {/* Content input (multiline) — no inline timer */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a thought…"
          rows={2}
          className="w-full rounded-full border border-secondary bg-surface px-6 py-3 pr-16 text-inverted placeholder:text-muted focus:outline-none focus:ring-2 ring-primary"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1.5 text-sm text-inverted hover:opacity-90 transition disabled:opacity-60"
          aria-label="Post"
          disabled={!canPost}
          title="Post"
        >
          ➤
        </button>
      </div>

      <p className="text-xs text-muted">Anonymous & mindful by design. Be kind.</p>
    </form>
  )
}
