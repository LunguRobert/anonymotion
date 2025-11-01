'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

function StatusIcon({ variant = 'info' }) {
  const map = {
    success: { bg: 'bg-emerald-500/15', fg: 'text-emerald-400' },
    expired: { bg: 'bg-amber-500/15',   fg: 'text-amber-400' },
    missing: { bg: 'bg-sky-500/15',     fg: 'text-sky-400' },
    unknown: { bg: 'bg-fuchsia-500/15', fg: 'text-fuchsia-400' },
  }[variant] || { bg: 'bg-white/10', fg: 'text-white/70' }

  return (
    <div className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl ${map.bg} ${map.fg}`}>
      {variant === 'success' ? (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 9v5m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  )
}

function ResendBlock() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')

  async function resend() {
    try {
      setLoading(true); setErr('')

      // dacă nu ești logat, cerem email (API acum răspunde 400 în acest caz)
      if (!email) {
        setErr('Please enter your email address.')
        return
      }

      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'Could not send the email.')
      }
      setDone(true)
    } catch (e) {
      setErr(e.message || 'Could not send the email.')
    } finally {
      setLoading(false)
    }
  }


  if (done) {
    return (
      <p className="mt-3 text-sm text-muted">
        If the address is registered, a verification link has been sent. Please check your inbox.
      </p>
    )
  }

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="Your email (optional if you're signed in)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 ring-primary"
      />
      <button
        type="button"
        onClick={resend}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-white shadow hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 ring-primary disabled:opacity-60"
      >
        {loading ? 'Sending…' : 'Send me a new email'}
      </button>
      {err ? <p className="sm:col-span-2 text-xs text-red-300">{err}</p> : null}
    </div>
  )
}


export default function VerifyClient() {
  const sp = useSearchParams()
  const status = useMemo(() => {
    const raw = sp.get('status')
    return raw ? String(raw).trim().toLowerCase() : null
  }, [sp])

  if (status === 'success') {
    return (
      <div className="text-center">
        <StatusIcon variant="success" />
        <h1 className="mt-4 text-2xl font-semibold text-inverted">Email verified</h1>
        <p className="mt-2 text-sm text-muted">
          Your account is now active. You can continue to your private space.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <a href="/user" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-white shadow hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 ring-primary">
            Go to your space
          </a>
          <a href="/" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white/90 hover:bg-white/10">
            Back home
          </a>
        </div>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="text-center">
        <StatusIcon variant="expired" />
        <h1 className="mt-4 text-2xl font-semibold text-inverted">Link expired or invalid</h1>
        <p className="mt-2 text-sm text-muted">
          The verification link is no longer valid. Request a new one from your account page.
        </p>
        <ResendBlock />
        <div className="mt-4 flex items-center justify-center">
          <a href="/user" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white/90 hover:bg-white/10">
            Open account
          </a>
        </div>
      </div>
    )
  }

  if (status === 'missing') {
    return (
      <div className="text-center">
        <StatusIcon variant="missing" />
        <h1 className="mt-4 text-2xl font-semibold text-inverted">Email verification</h1>
        <p className="mt-2 text-sm text-muted">
          You need to request a verification email first from your account page.
        </p>
        <ResendBlock />
        <div className="mt-4 flex items-center justify-center">
          <a href="/user" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white/90 hover:bg-white/10">
            Open account
          </a>
        </div>
      </div>
    )
  }

  // Unknown / default
  return (
    <div className="text-center">
      <StatusIcon variant="unknown" />
      <h1 className="mt-4 text-2xl font-semibold text-inverted">Email verification</h1>
      <p className="mt-2 text-sm text-muted">
        Unknown status. Please try the link again or request a new email.
      </p>
      <ResendBlock />
      <div className="mt-4 flex items-center justify-center">
        <a href="/user" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white/90 hover:bg-white/10">
          Open account
        </a>
      </div>
    </div>
  )
}
