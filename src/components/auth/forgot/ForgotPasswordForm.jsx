'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isValidEmail = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email])
  useEffect(() => { if (error) setError('') }, [email])

  async function onSubmit(e) {
    e.preventDefault()
    if (!isValidEmail || loading) return
    setLoading(true); setError('')
    try {
      await fetch('/api/auth/password/reset/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  // Success
  if (sent) {
    return (
      <Screen>
        <Decor />
        <Card>
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl"
               style={{ backgroundColor: 'color-mix(in oklab, var(--color-success) 15%, transparent)' , color: 'var(--color-success)'}}>
            <IconCheck />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-inverted)] text-center">Check your inbox</h1>
          <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
            If an account exists for <b className="text-[var(--color-inverted)]">{email}</b>, you’ll receive a reset link shortly.
            Please also check your <i>Spam</i>/<i>Promotions</i> folders.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/auth/signin" className="btn-primary">Back to sign in</Link>
            <button
              type="button"
              onClick={() => { setSent(false); setEmail(''); setError(''); }}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium
                        border border-[var(--color-secondary)] text-[var(--color-inverted)] bg-[var(--color-surface)]
                        hover:bg-[var(--color-card)] transition
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              Send to a different email
            </button>
          </div>
        </Card>
      </Screen>
    )
  }

  // Form
  return (
    <Screen>
      <Decor />
      <Card>
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`, boxShadow: `0 10px 20px -10px color-mix(in oklab, var(--color-primary) 60%, transparent)` }}>
            <IconMail />
          </span>
          <div>
            <h1 className="text-xl font-semibold leading-tight text-[var(--color-inverted)]">Forgot your password?</h1>
            <p className="text-sm text-[var(--color-muted)]">We’ll email you a link to reset it.</p>
          </div>
        </div>

        {error ? (
          <p role="alert" aria-live="polite" className="mb-4 rounded-lg border px-3 py-2 text-sm"
             style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', background: 'color-mix(in oklab, var(--color-danger) 10%, transparent)' }}>
            <span className="inline-flex items-center gap-2"><IconAlert />{error}</span>
          </p>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <div className="mb-1.5">
              <span className="text-sm font-medium text-[var(--color-inverted)]">Email address</span>
            </div>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border px-4 py-3 pr-10 text-[var(--color-inverted)] placeholder-[var(--color-muted)] outline-none transition focus:ring-2"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-secondary)' }}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center text-[var(--color-muted)]">
                <IconMail />
              </span>
            </div>
            {email && !isValidEmail && (
              <span className="mt-2 block text-xs" style={{ color: 'var(--color-danger)' }}>Please enter a valid email address.</span>
            )}
          </label>

          <button
            type="submit"
            disabled={!isValidEmail || loading}
            className="w-full inline-flex items-center justify-center gap-2
            rounded-xl px-4 py-3 text-sm font-semibold
            text-[var(--color-inverted)]
            bg-[var(--color-primary)] border border-[var(--color-secondary)]
            shadow-lg shadow-black/20
            transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]
            hover:brightness-110 active:translate-y-px
            disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2"><Spinner /> Sending…</span>
            ) : 'Send reset link'}
          </button>

          <p className="text-center text-xs text-[var(--color-muted)]">
            For your security, we won’t confirm whether an email is registered.
          </p>

          <div className="text-center text-sm">
            <Link className="link" href="/auth/signin">Back to sign in</Link>
          </div>
        </form>
      </Card>
    </Screen>
  )
}

/* ---------- Primitives ---------- */

function Screen({ children }) {
  const [h, setH] = useState(null)

  useEffect(() => {
    const calc = () => {
      const header = document.querySelector('header')
      const footer = document.querySelector('footer')
      const vh = (window.visualViewport?.height ?? window.innerHeight)
      const hh = header?.offsetHeight ?? 0
      const fh = footer?.offsetHeight ?? 0
      // spațiul exact disponibil pentru containerul paginii (fără header+footer)
      const usable = Math.max(vh - hh - fh, 0)
      setH(usable)
    }
    calc()
    window.addEventListener('resize', calc)
    window.addEventListener('orientationchange', calc)
    window.visualViewport?.addEventListener?.('resize', calc)
    return () => {
      window.removeEventListener('resize', calc)
      window.removeEventListener('orientationchange', calc)
      window.visualViewport?.removeEventListener?.('resize', calc)
    }
  }, [])

  return (
    <div
      className="relative grid place-items-center px-4 min-h-0 w-full overflow-hidden"
      style={{
        backgroundColor: 'var(--color-background)',
        height: h ? `${h}px` : undefined, // Header + container + Footer = 100vh
      }}
    >
      {children}
    </div>
  )
}

function Card({ children }) {
  return (
    <div className="w-full max-w-lg rounded-3xl border p-6 shadow-2xl backdrop-blur"
         style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-secondary)' }}>
      {children}
    </div>
  )
}
function Decor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'var(--lamp-glow)' }}>
      <div className="absolute bottom-0 left-0 right-0 h-px"
           style={{ background: `linear-gradient(90deg, transparent, var(--color-secondary), transparent)` }} />
    </div>
  )
}

/* ---------- Icons ---------- */

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z" />
    </svg>
  )
}
function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M22 8l-9.2 6.1a2 2 0 01-2.2 0L1.5 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 7L10 17l-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconAlert() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 9v4m0 4h.01M10.3 3.8L2.7 17.2A2 2 0 004.4 20h15.2a2 2 0 001.7-2.8L13.7 3.8a2 2 0 00-3.4 0z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
