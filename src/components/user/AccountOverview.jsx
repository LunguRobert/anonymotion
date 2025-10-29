// src/components/user/AccountOverview.jsx
'use client'
import { createPortal } from 'react-dom'

import { useEffect, useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, ChevronDown, Search, X } from 'lucide-react'

function readJsonSafe(res) {
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) return res.text().then(t => { throw new Error(t || `Bad response (${res.status})`) })
  return res.json().then(j => { if (!res.ok) throw new Error(j?.error || 'Error'); return j })
}

function getSupportedTimezones() {
  // preferăm lista nativă unde e disponibilă
  if (typeof Intl !== 'undefined' && Intl.supportedValuesOf) {
    const list = Intl.supportedValuesOf('timeZone')
    return Array.isArray(list) && list.length ? list : null
  }
  return null
}

const FALLBACK_TIMEZONES = [
  'UTC',
  'Europe/Bucharest',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
]

export default function AccountOverview() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [editing, setEditing] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)

  const tzList = useMemo(() => getSupportedTimezones() || FALLBACK_TIMEZONES, [])
  const [timezone, setTimezone] = useState('UTC')

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true); setError('')
      try {
        const res = await fetch('/api/user/account', { cache: 'no-store' })
        const json = await readJsonSafe(res)
        if (!alive) return
        setData(json)
        const tz = json.user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        setTimezone(tz)
      } catch (e) {
        if (!alive) return
        setError(e.message || 'Failed to load account')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  async function saveTimezone() {
    try {
      const res = await fetch('/api/user/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone }),
      })
      const json = await readJsonSafe(res)
      setData(prev => ({ ...prev, user: json.user }))
      setEditing(false)
    } catch (e) {
      alert(e.message || 'Failed to save')
    }
  }

  const plan = data?.user?.plan || 'FREE'
  const canChangePassword = !!data?.canChangePassword

  return (
    <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-6 sm:p-8 mb-8">
      <div className="glow-lamp absolute inset-0" />
      <div className="relative z-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/10 border border-white/15" />
            <div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-inverted">Account overview</h2>
              <p className="text-xs text-white/70">Your profile & plan at a glance.</p>
            </div>
          </div>

          {!loading && data?.user && (
            <div className="flex items-center gap-2">
              {plan === 'PREMIUM' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 text-yellow-200 border border-yellow-500/30 px-3 py-1 text-xs">
                  <Crown className="h-3.5 w-3.5" /> Premium
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 text-white/80 border border-white/15 px-3 py-1 text-xs">
                  Free
                </span>
              )}
              {plan === 'FREE' ? (
                <a href="/pricing" className="rounded-full bg-pink-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-pink-700 transition">
                  Upgrade
                </a>
              ) : (
                <a href="/billing" className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition">
                  Manage subscription
                </a>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-secondary bg-card p-4 text-center">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {!loading && data?.user && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Details (fără name) */}
            <div className="rounded-2xl border border-secondary bg-card p-4 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-inverted">Details</h3>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="text-xs text-white/80 hover:underline">Edit timezone</button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditing(false)} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10">Cancel</button>
                    <button onClick={saveTimezone} className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">Save</button>
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                <Field label="Email" value={data.user.email} readOnly />
                <Field label="Plan" value={plan} readOnly />
                <TimezoneDropdown
                  editable={editing}
                  value={timezone}
                  onChange={setTimezone}
                  options={tzList}
                />
              </div>
            </div>

            {/* Quick actions — fully responsive */}
            <div className="rounded-2xl border border-secondary bg-card p-3 sm:p-6">
              <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold text-inverted">Quick actions</h3>
              <div className="space-y-2 sm:space-y-3">
                <ActionRow
                  title="Change password"
                  hint={canChangePassword ? 'Update your password securely.' : 'Password is managed by your sign-in provider.'}
                  actionLabel="Open"
                  disabled={!canChangePassword}
                  onClick={() => canChangePassword && setPwdOpen(true)}
                />
                {plan === 'FREE' ? (
                  <ActionRow
                    title="Upgrade plan"
                    hint="Unlock premium insights and exports."
                    actionLabel="Upgrade"
                    onClick={() => (window.location.href = '/pricing')}
                  />
                ) : (
                  <ActionRow
                    title="Manage subscription"
                    hint="Billing and subscription settings."
                    actionLabel="Manage"
                    disabled={true}
                    onClick={() => (window.location.href = '/billing')}
                  />
                )}
              </div>
            </div>

          </div>
        )}

        {/* Password modal */}
        <AnimatePresence>
          {pwdOpen && <PasswordModal onClose={() => setPwdOpen(false)} />}
        </AnimatePresence>
      </div>
    </section>
  )
}

/* --- small building blocks --- */

function Field({ label, value, readOnly }) {
  return (
    <label className="block">
      <div className="text-xs text-white/60 mb-1">{label}</div>
      <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">{value || '—'}</div>
    </label>
  )
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = () => setMatches(mq.matches)
    handler()
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [query])
  return matches
}

function TimezoneDropdown({ editable, value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const triggerRef = useRef(null)
  const isDesktop = useMediaQuery('(min-width: 640px)') // sm breakpoint

  // close on outside click – include și portalul
  useEffect(() => {
    function onDoc(e) {
      const inRoot = e.target.closest && e.target.closest('[data-tz-root]')
      const inPortal = e.target.closest && e.target.closest('[data-tz-portal]')
      if (!inRoot && !inPortal) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return options
    return options.filter(tz => tz.toLowerCase().includes(query))
  }, [q, options])

  function offsetLabel(tz) {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(new Date())
      const off = parts.find(p => p.type === 'timeZoneName')?.value || ''
      return off.replace('GMT', 'UTC')
    } catch { return 'UTC' }
  }

  // —— desktop portal positioning
  const [pos, setPos] = useState({ left: 0, top: 0, width: 0 })
  useEffect(() => {
    if (!open || !isDesktop) return
    function recalc() {
      const el = triggerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setPos({ left: Math.round(r.left), top: Math.round(r.bottom + 8), width: Math.round(r.width) })
    }
    recalc()
    window.addEventListener('resize', recalc)
    window.addEventListener('scroll', recalc, true)
    return () => {
      window.removeEventListener('resize', recalc)
      window.removeEventListener('scroll', recalc, true)
    }
  }, [open, isDesktop])

  if (!editable) {
    return (
      <label className="block min-w-0">
        <div className="text-xs text-white/60 mb-1">Timezone</div>
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 truncate">{value}</div>
      </label>
    )
  }

  // conținutul dropdown-ului (folosit deopotrivă în portal și în sheet)
  const Menu = (
    <div className="w-full max-w-full rounded-2xl border border-white/10 bg-card p-2 shadow-xl">
      {/* search */}
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <Search className="h-4 w-4 text-white/60 shrink-0" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search timezone…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
        />
        {q && (
          <button onClick={() => setQ('')} className="rounded p-1 hover:bg-white/10">
            <X className="h-4 w-4 text-white/70" />
          </button>
        )}
      </div>

      {/* list */}
      <ul role="listbox" className="mt-2 max-h-64 overflow-auto rounded-xl">
        {filtered.length === 0 ? (
          <li className="px-3 py-2 text-sm text-white/60">No results</li>
        ) : filtered.map((tz) => {
          const selected = tz === value
          return (
            <li key={tz}>
              <button
                onClick={() => { onChange(tz); setOpen(false) }}
                role="option"
                aria-selected={selected}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-white/5 ${
                  selected ? 'bg-white/5' : ''
                }`}
              >
                <span className="truncate">{tz}</span>
                <span className="text-xs text-white/60">{offsetLabel(tz)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )

  return (
    <div className="block min-w-0" data-tz-root>
      <div className="text-xs text-white/60 mb-1">Timezone</div>

      {/* trigger */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        className="flex w-full min-w-0 items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{value}</span>
        <ChevronDown className="h-4 w-4 opacity-70 shrink-0" />
      </button>

      {/* DESKTOP: portal fix — scapă din overflow */}
      {open && isDesktop && createPortal(
        <div
          data-tz-portal
          style={{ position: 'fixed', left: pos.left, top: pos.top, width: pos.width, zIndex: 1000 }}
        >
          {Menu}
        </div>,
        document.body
      )}

      {/* MOBILE: sheet full-screen */}
      <AnimatePresence>
        {open && !isDesktop && (
          <motion.div
            className="fixed inset-0 z-[80] bg-black/60"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-x-0 bottom-0 top-16 rounded-t-2xl border border-white/10 bg-card p-3"
              initial={{ y: 24 }} animate={{ y: 0 }} exit={{ y: 24 }}
            >
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium text-white/90">Select timezone</h4>
                <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {Menu}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


function ActionRow({ title, hint, actionLabel, onClick, disabled }) {
  return (
    <div className="min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3">
      <div className="min-w-0">
        <p className="text-[13px] sm:text-sm text-inverted truncate">{title}</p>
        {hint && <p className="text-[11px] sm:text-xs text-white/60">{hint}</p>}
      </div>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full sm:w-auto shrink-0 rounded-full px-3 py-2 sm:py-1.5 text-[12px] sm:text-xs transition ${
          disabled
            ? 'border border-white/10 bg-white/5 text-white/50 cursor-not-allowed'
            : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
        }`}
      >
        {actionLabel}
      </button>
    </div>
  )
}


function PasswordModal({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const strengthHint = 'Use at least 10 characters, including uppercase, lowercase, number, and symbol.'

  async function submit() {
    try {
      setLoading(true); setError('')
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed')
      setOk(true)
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (e) {
      setError(e.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="w-full max-w-sm rounded-2xl border border-white/15 bg-card p-6"
        initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 14, opacity: 0 }}
      >
        <h3 className="text-lg font-semibold text-inverted">Change password</h3>
        <p className="text-xs text-white/70 mb-4">{strengthHint}</p>

        {ok ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            Password updated successfully.
          </div>
        ) : (
          <>
            {error && <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-200">{error}</div>}

            <label className="block mb-2">
              <div className="text-xs text-white/60 mb-1">Current password</div>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
              />
            </label>

            <label className="block mb-2">
              <div className="text-xs text-white/60 mb-1">New password</div>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
              />
            </label>

            <label className="block">
              <div className="text-xs text-white/60 mb-1">Confirm new password</div>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
              />
            </label>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={onClose} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition">Cancel</button>
              <button
                onClick={submit}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </>
        )}

        {ok && (
          <div className="mt-4 text-right">
            <button onClick={onClose} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition">
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
