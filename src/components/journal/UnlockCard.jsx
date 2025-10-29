// components/journal/UnlockCard.jsx
'use client'
import { useEffect, useState } from 'react'

export default function UnlockCard() {
  const [need, setNeed] = useState(false)
  const [hint, setHint] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/journal/journal-lock', { cache: 'no-store' })
        const s = await r.json().catch(() => null)
        if (r.ok && s?.enabled) {
          setNeed(true)
          setHint(s?.hint || null)
        } else {
          setNeed(false)
        }
      } catch {
        // fallback: nu afișăm cardul dacă statusul nu poate fi citit
        setNeed(false)
      }
    })()
  }, [])

  if (!need) return null

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const pwd = String(fd.get('pwd') || '')

    try {
      const res = await fetch('/api/journal/journal-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr(j?.error || 'Invalid password')
        return
      }
      window.location.reload()
    } catch {
      setErr('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="
        w-full max-w-xl mx-auto
        rounded-2xl border border-secondary/60 bg-card/60
        p-4 sm:p-5
      "
    >
      <div className="text-sm font-semibold">Journal locked</div>
      <p className="mt-1 text-xs text-muted">
        Enter your journal password{hint ? ` (hint: ${hint})` : ''}.
      </p>

      {/* câmp 'username' invizibil pentru a liniști warning-urile de accesibilitate */}
      <input
        type="text"
        name="username"
        autoComplete="username"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <div
        className="
          mt-3
          flex flex-col sm:flex-row
          items-stretch sm:items-center
          gap-2
        "
      >
        <div className="relative flex-1">
          <label htmlFor="pwd" className="sr-only">Journal password</label>
          <input
            id="pwd"
            name="pwd"
            type={showPwd ? 'text' : 'password'}
            placeholder="Journal password"
            autoComplete="current-password"
            required
            className="
              w-full
              rounded-lg border border-secondary/60 bg-surface/60
              px-3 py-2 pr-10
              text-sm
            "
            aria-invalid={err ? 'true' : 'false'}
            aria-describedby={err ? 'unlock-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              rounded-md border border-secondary/60 bg-card/60
              px-2 py-1 text-[11px] text-inverted/80
              hover:text-inverted
            "
            title={showPwd ? 'Hide password' : 'Show password'}
            aria-label={showPwd ? 'Hide password' : 'Show password'}
          >
            {showPwd ? 'Hide' : 'Show'}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="
            w-full sm:w-auto
            inline-flex items-center justify-center gap-2
            rounded-lg bg-primary px-4 py-2
            text-sm font-medium text-inverted
            transition hover:opacity-90
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {loading && (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
              <path d="M22 12a10 10 0 0 1-10 10" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
          )}
          Unlock
        </button>
      </div>

      {err ? (
        <p
          id="unlock-error"
          role="alert"
          className="mt-2 text-xs text-red-300"
        >
          {err}
        </p>
      ) : null}
    </form>
  )
}
