'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircleHeart,
  X,
  Send,
  Loader2,
  CheckCircle2,
  Star,
  Bug,
  Sparkles,
  Heart,
  Lightbulb,
} from 'lucide-react'

export default function FeedbackButton({ origin = 'app', className = '' }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [portalTarget, setPortalTarget] = useState(null)

  useEffect(() => {
    setMounted(true)
    setPortalTarget(document.body)
  }, [])

  // Scroll lock when modal is open
  useEffect(() => {
    if (!mounted) return
    const body = document.body
    const prev = body.style.overflow
    if (open) body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = prev
    }
  }, [open, mounted])

  return (
    <>
      <Fab onClick={() => setOpen(true)} className={className} />
      {mounted && portalTarget && (
        <FeedbackModal
          open={open}
          onClose={() => setOpen(false)}
          origin={origin}
          portalTarget={portalTarget}
        />
      )}
    </>
  )
}

function Fab({ onClick, className }) {
  return (
    <button
      onClick={onClick}
      aria-label="Give feedback"
      className={
        'group relative inline-flex items-center gap-2 rounded-full px-5 py-3 ' +
        'bg-gradient-to-br from-pink-500 via-fuchsia-500 to-indigo-600 text-white ' +
        'shadow-[0_10px_30px_-10px_rgba(99,102,241,0.6)] hover:shadow-[0_20px_45px_-12px_rgba(99,102,241,0.65)] ' +
        'transition-all duration-300 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ' +
        'backdrop-blur-xl border border-white/10 ' +
        (className || '')
      }
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <span className="absolute -inset-px rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition" />
      <MessageCircleHeart className="h-5 w-5 drop-shadow" />
      <span className="font-medium">Give feedback</span>
    </button>
  )
}

function FeedbackModal({ open, onClose, origin, portalTarget }) {
  const containerRef = useRef(null)
  const firstFocusableRef = useRef(null)

  // Focus trap + Esc to close
  useEffect(() => {
    if (!open) return

    // Focus first interactive element
    const to = setTimeout(() => {
      firstFocusableRef.current?.focus()
    }, 0)

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'Tab') {
        // simple trap
        const focusables = containerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusables || focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      clearTimeout(to)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[99999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal card */}
          <div className="absolute inset-0 grid place-items-center p-4 sm:p-6">
            <motion.div
              ref={containerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Feedback form"
              className={
                'w-full max-w-lg rounded-3xl border border-white/10 bg-white/80 text-zinc-900 ' +
                'shadow-2xl backdrop-blur-2xl dark:bg-zinc-900/80 dark:text-zinc-100 ' +
                'ring-1 ring-black/5'
              }
              initial={{ y: 20, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 10, scale: 0.98, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <Header onClose={onClose} />
              <Form origin={origin} firstFocusableRef={firstFocusableRef} onClose={onClose} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalTarget
  )
}

function Header({ onClose }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-white shadow">
          <MessageCircleHeart className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold leading-tight">We value your feedback</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Tell us what to improve — we read every message.</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="rounded-full p-2 text-zinc-500 hover:bg-zinc-900/5 hover:text-zinc-800 dark:hover:bg-white/5 dark:hover:text-white"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

function Form({ origin, firstFocusableRef, onClose }) {
  const [type, setType] = useState('feature')
  const [rating, setRating] = useState(5)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // simple textarea autoresize
  const taRef = useRef(null)
  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 300) + 'px'
  }, [message])

  // cooldown after success (client-side, complements server rate limit)
  useEffect(() => {
    if (!ok) return
    setCooldown(10)
    const i = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(i)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(i)
  }, [ok])

  const canSubmit = message.trim().length >= 5 && !loading && cooldown === 0
  const remaining = Math.max(0, 800 - message.length)

  const chips = useMemo(
    () => [
      { id: 'feature', label: 'Feature', icon: Sparkles },
      { id: 'bug', label: 'Bug', icon: Bug },
      { id: 'praise', label: 'Praise', icon: Heart },
      { id: 'other', label: 'Other', icon: Lightbulb },
    ],
    []
  )

  const submit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, rating, message, email, from: origin }),
      })
      if (res.ok) {
        setOk(true)
        setMessage('')
        setTimeout(() => {
          setOk(false)
          onClose()
        }, 1200)
      } else {
        const b = await res.json().catch(() => ({}))
        setError(b?.error || 'Something went wrong. Please try again a bit later.')
      }
    } catch (e) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-5 pb-5">
      {/* Type chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map(({ id, label, icon: Icon }) => {
          const active = type === id
          return (
            <button
              key={id}
              ref={id === 'feature' ? firstFocusableRef : null}
              onClick={() => setType(id)}
              className={
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ' +
                (active
                  ? 'border-fuchsia-400 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300'
                  : 'border-zinc-200/60 bg-white/60 text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300')
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}
      </div>

      {/* Rating */}
      <div className="mt-4">
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
          Overall experience
        </label>
        <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating">
          {Array.from({ length: 5 }).map((_, i) => {
            const val = i + 1
            const active = val <= rating
            return (
              <button
                key={val}
                aria-label={`Rate ${val} star${val > 1 ? 's' : ''}`}
                onClick={() => setRating(val)}
                className={'p-2 rounded-lg transition ' + (active ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-500')}
              >
                <Star className={'h-5 w-5 ' + (active ? 'fill-current' : '')} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Message */}
      <div className="mt-4">
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Message</label>
        <div className="rounded-2xl border border-zinc-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 overflow-hidden focus-within:ring-2 focus-within:ring-fuchsia-400">
          <textarea
            ref={taRef}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 800))}
            rows={4}
            placeholder="Tell us what's great, what's confusing, or what you'd love to see next…"
            className="block w-full resize-none bg-transparent p-3 text-sm outline-none placeholder:text-zinc-400"
          />
          <div className="flex items-center justify-between px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{Math.max(0, message.trim().length)} / 800</span>
            <span className="opacity-70">We read every message</span>
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="mt-4">
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
          Email (optional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@email.com"
          className="w-full rounded-2xl border border-zinc-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-400"
        />
      </div>

      {/* Error / Success */}
      <div className="mt-3 min-h-[1.25rem]">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <AnimatePresence>
          {ok && (
            <motion.p
              className="flex items-center gap-2 text-sm text-green-600"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <CheckCircle2 className="h-5 w-5" /> Thank you! Feedback sent.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-2xl border border-zinc-300/70 dark:border-white/10 px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-white/5 transition"
        >
          Cancel
        </button>
        <button
          disabled={!canSubmit}
          onClick={submit}
          className={
            'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm transition ' +
            (canSubmit
              ? 'bg-gradient-to-br from-fuchsia-500 via-pink-500 to-indigo-600 text-white shadow hover:shadow-lg'
              : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed')
          }
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending…
            </>
          ) : cooldown > 0 ? (
            <>Please wait {cooldown}s</>
          ) : (
            <>
              <Send className="h-4 w-4" /> Send
            </>
          )}
        </button>
      </div>
    </div>
  )
}
