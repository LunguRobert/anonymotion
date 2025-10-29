'use client'
import { useEffect, useState } from 'react'

export default function LockSettings() {
  const [status, setStatus] = useState(null) // { enabled, hint, isPremium }
  const [pwd, setPwd] = useState('')         // new password
  const [hint, setHint] = useState('')
  const [current, setCurrent] = useState('') // current password (disable / change)
  const [err, setErr] = useState('')         // inline errors
  const [busy, setBusy] = useState(false)

  async function load() {
    try {
      const res = await fetch('/api/journal/journal-lock', { cache: 'no-store' })
      const data = await res.json().catch(() => null)
      if (res.ok && data) setStatus(data)
      else setStatus({ enabled: false, hint: '', isPremium: false })
    } catch {
      setStatus({ enabled: false, hint: '', isPremium: false })
    }
  }
  useEffect(() => { load() }, [])

  function clearAndReload() {
    setPwd(''); setHint(''); setCurrent(''); setErr(''); load()
  }

  async function enable(e) {
    e?.preventDefault?.()
    setErr('')
    // client-side checks
    if (!status?.enabled) {
      if (!pwd || pwd.length < 4) {
        setErr('Password must be at least 4 characters.')
        return
      }
    } else {
      // changing password is optional; if present, enforce 4+
      if (pwd && pwd.length < 4) {
        setErr('New password must be at least 4 characters.')
        return
      }
      if (!current) {
        setErr('Current password is required to update settings.')
        return
      }
    }

    setBusy(true)
    try {
      const res = await fetch('/api/journal/journal-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: true,
          newPassword: pwd || undefined,
          hint,
          currentPassword: current || undefined,
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr(j?.error || 'Save failed.')
        return
      }
      clearAndReload()
    } finally {
      setBusy(false)
    }
  }

  async function disable(e) {
    e?.preventDefault?.()
    setErr('')
    if (!current) {
      setErr('Current password is required to disable the lock.')
      return
    }

    setBusy(true)
    try {
      const res = await fetch('/api/journal/journal-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: false, currentPassword: current }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr(j?.error || 'Disable failed.')
        return
      }
      clearAndReload()
    } finally {
      setBusy(false)
    }
  }

  if (!status) return null
  const notPremium = status.isPremium === false

  return (
    <div className="rounded-xl border border-secondary/60 bg-card/60 p-4 sm:p-5 text-sm">
      <div className="font-semibold">Journal password</div>

      {notPremium ? (
        <>
          <p className="mt-1 text-muted">This feature is available on Premium.</p>
          <a
            href="/pricing"
            className="mt-3 inline-flex w-full sm:w-auto justify-center rounded-lg bg-primary px-4 py-2 text-inverted"
          >
            Go Premium
          </a>
        </>
      ) : status.enabled ? (
        <>
          <p className="mt-1 text-muted">Your journal is locked.</p>

          <form onSubmit={enable} noValidate className="mt-3 space-y-3">
            {/* quiet username field for a11y */}
            <input type="text" name="username" autoComplete="username" className="sr-only" tabIndex={-1} aria-hidden="true" />

            {/* inputs: 1 col on mobile, 2 cols on ≥sm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                value={current}
                onChange={e => setCurrent(e.target.value)}
                type="password"
                name="current-password"
                autoComplete="current-password"
                placeholder="Current password (required)"
                className="w-full rounded-lg border border-secondary/60 bg-surface/60 px-3 py-2"
                required
              />
              <input
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                type="password"
                name="new-password"
                autoComplete="new-password"
                placeholder="New password (optional, 4+)"
                className="w-full rounded-lg border border-secondary/60 bg-surface/60 px-3 py-2"
              />
              <input
                value={hint}
                onChange={e => setHint(e.target.value)}
                type="text"
                name="hint"
                placeholder="Hint (optional)"
                className="w-full rounded-lg border border-secondary/60 bg-surface/60 px-3 py-2 sm:col-span-2"
              />
            </div>

            {err && (
              <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">
                {err}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full sm:w-auto justify-center rounded-lg bg-primary px-4 py-2 text-inverted disabled:opacity-60"
              >
                {pwd ? 'Save new password' : 'Update'}
              </button>
              <button
                type="button"
                onClick={disable}
                disabled={busy}
                className="inline-flex w-full sm:w-auto justify-center rounded-lg border border-secondary/60 bg-surface/60 px-3 py-2"
                title="Requires current password"
              >
                Disable
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <p className="mt-1 text-muted">Set a password to protect your journal.</p>

          <form onSubmit={enable} noValidate className="mt-3 space-y-3">
            <input type="text" name="username" autoComplete="username" className="sr-only" tabIndex={-1} aria-hidden="true" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                type="password"
                name="new-password"
                autoComplete="new-password"
                placeholder="Password (min 4 chars)"
                className="w-full rounded-lg border border-secondary/60 bg-surface/60 px-3 py-2"
                required
                minLength={4}
              />
              <input
                value={hint}
                onChange={e => setHint(e.target.value)}
                type="text"
                name="hint"
                placeholder="Hint (optional)"
                className="w-full rounded-lg border border-secondary/60 bg-surface/60 px-3 py-2"
              />
            </div>

            {err && (
              <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={!pwd || pwd.length < 4 || busy}
              className="inline-flex w-full sm:w-auto justify-center rounded-lg bg-primary px-4 py-2 text-inverted disabled:opacity-60"
            >
              Enable
            </button>
          </form>
        </>
      )}
    </div>
  )
}
