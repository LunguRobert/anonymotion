'use client'

import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function Check({ ok }) {
  return ok ? (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--color-success)]" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--color-muted)]" viewBox="0 0 24 24" fill="none">
      <path d="M15 9l-6 6m0-6l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function Eye({ open }) {
  return open ? (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.58 6.16A9.7 9.7 0 0 1 12 6c6.5 0 10 6 10 6a16.3 16.3 0 0 1-4.08 4.66M6.2 6.2C3.7 7.9 2 12 2 12s3.5 7 10 7c1.5 0 2.9-.3 4.2-.84" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function strengthScore(pw) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s += 1
  if (pw.length >= 12) s += 1
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 1
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) s += 1
  return Math.min(s, 4)
}
function strengthLabel(score) {
  return ['Very weak', 'Weak', 'OK', 'Good', 'Excellent'][score]
}

export default function ResetPasswordForm() {
  const sp = useSearchParams()
  const token = sp.get('token') || ''
  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const score = useMemo(() => strengthScore(pw1), [pw1])
  const canSubmit = useMemo(() => pw1 && pw1 === pw2 && pw1.length >= 8, [pw1, pw2])

  useEffect(() => { if (error) setError('') }, [pw1, pw2])

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit || loading) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/password/reset/confirm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, password: pw1 }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j?.error || 'Could not reset password.')
      } else setDone(true)
    } catch {
      setError('Could not reset password.')
    }
    setLoading(false)
  }

  // ===== Invalid link
  if (!token) {
    return (
      <Screen>
        <Decor />
        <Card>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-[var(--color-inverted)]">Invalid link</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">The reset link is missing or malformed.</p>
          </div>
          <div className="flex justify-center">
            <Link href="/auth/forgot" className="btn-primary">Request a new link</Link>
          </div>
        </Card>
      </Screen>
    )
  }

  // ===== Success
  if (done) {
    return (
      <Screen>
        <Decor />
        <Card>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl" style={{ backgroundColor: 'color-mix(in oklab, var(--color-success) 15%, transparent)' , color: 'var(--color-success)'}}>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h1 className="text-2xl font-semibold text-[var(--color-inverted)]">Password updated</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">You can now sign in using your new password.</p>
          </div>
          <div className="flex justify-center">
            <Link href="/auth/signin" className="btn-primary">Go to sign in</Link>
          </div>
        </Card>
      </Screen>
    )
  }

  // ===== Form
  return (
    <Screen>
      <Decor />
      <div className="mx-4 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left: copy */}
        <Card>
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
              style={{ borderColor: 'var(--color-secondary)', backgroundColor: 'var(--color-surface)', color: 'var(--color-muted)' }}>
              Account security
            </span>
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-[var(--color-inverted)]">Reset your password</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
            Choose a strong password to keep your journal safe. Active sessions will be revoked after the change.
          </p>

          {/* Requirements checklist */}
          <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: 'var(--color-secondary)', backgroundColor: 'var(--color-surface)' }}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Recommended requirements</p>
            <ul className="space-y-2 text-sm text-[var(--color-inverted)]/90">
              <li className="flex items-center gap-2"><Check ok={pw1.length >= 8} /> At least 8 characters</li>
              <li className="flex items-center gap-2"><Check ok={/[A-Z]/.test(pw1)} /> Uppercase letter (A–Z)</li>
              <li className="flex items-center gap-2"><Check ok={/[a-z]/.test(pw1)} /> Lowercase letter (a–z)</li>
              <li className="flex items-center gap-2"><Check ok={/\d/.test(pw1)} /> Number (0–9) or symbol</li>
              <li className="flex items-center gap-2"><Check ok={/[^A-Za-z0-9]/.test(pw1)} /> Symbol (!@#$…)</li>
            </ul>
          </div>
        </Card>

        {/* Right: form */}
        <Card>
          <form onSubmit={onSubmit} className="space-y-5">
            {/* New password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-inverted)]">New password</label>
              <div className="relative">
                <input
                  type={show1 ? 'text' : 'password'}
                  value={pw1}
                  onChange={e => setPw1(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  required
                  className="w-full rounded-xl border px-4 py-3 text-[var(--color-inverted)] placeholder-[var(--color-muted)] outline-none transition focus:ring-2"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-secondary)', boxShadow: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShow1(v => !v)}
                  className="absolute inset-y-0 right-3 inline-flex items-center"
                  aria-label={show1 ? 'Hide password' : 'Show password'}
                >
                  <Eye open={show1} />
                </button>
              </div>

              {/* Strength bar */}
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-muted)]">
                  <span>Password strength</span>
                  <span className="font-medium text-[var(--color-inverted)]/80">{strengthLabel(score)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--color-secondary)' }}>
                  <div
                    className={[
                      'h-full transition-all duration-300',
                      score === 0 && 'w-1/12',
                      score === 1 && 'w-1/4',
                      score === 2 && 'w-2/4',
                      score === 3 && 'w-3/4',
                      score === 4 && 'w-full',
                    ].filter(Boolean).join(' ')}
                    style={{ backgroundColor: score <= 1 ? 'var(--color-danger)' : score === 2 ? 'var(--color-accent)' : 'var(--color-success)' }}
                  />
                </div>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-inverted)]">Confirm password</label>
              <div className="relative">
                <input
                  type={show2 ? 'text' : 'password'}
                  value={pw2}
                  onChange={e => setPw2(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Repeat the password"
                  required
                  className="w-full rounded-xl border px-4 py-3 text-[var(--color-inverted)] placeholder-[var(--color-muted)] outline-none transition focus:ring-2"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-secondary)', boxShadow: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShow2(v => !v)}
                  className="absolute inset-y-0 right-3 inline-flex items-center"
                  aria-label={show2 ? 'Hide password' : 'Show password'}
                >
                  <Eye open={show2} />
                </button>
              </div>
              {pw2 && pw1 !== pw2 && (
                <p className="mt-2 text-xs" style={{ color: 'var(--color-danger)' }}>Passwords do not match.</p>
              )}
            </div>

            {/* Server error */}
            {error ? (
              <p role="alert" aria-live="polite" className="rounded-lg border px-3 py-2 text-sm"
                 style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', background: 'color-mix(in oklab, var(--color-danger) 10%, transparent)' }}>
                {error}
              </p>
            ) : null}

            {/* CTA */}
            <button
              type="submit"
              disabled={!canSubmit || loading}
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
                <span className="inline-flex items-center gap-2">
                  <Spinner /> Saving…
                </span>
              ) : 'Reset password'}
            </button>

            <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
              <Link href="/auth/signin" className="link">Back to sign in</Link>
              <Link href="/auth/forgot" className="link">Request a different link</Link>
            </div>
          </form>
        </Card>
      </div>
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
    <div className="rounded-3xl border p-8 shadow-2xl backdrop-blur"
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

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z" />
    </svg>
  )
}

/* Reusable button/link styles via Tailwind + CSS vars */
function ButtonBase({ as:Comp='button', className='', ...props }) {
  return <Comp className={className} {...props} />
}
export function Button(props){ return <ButtonBase {...props} /> }

