'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail, Lock, Eye, EyeOff, User, Shield, CheckCircle2, AlertCircle,
  Loader2, ArrowRight, Check, LogIn, AlertTriangle, Sparkles
} from 'lucide-react'
import { signIn } from 'next-auth/react'

/* --------------------------- helpers --------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function scorePassword(pw) {
  // quick entropy-ish score (0..4)
  let score = 0
  if (!pw) return 0
  if (pw.length >= 12) score++
  if (pw.length >= 16) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

function cls(...parts) { return parts.filter(Boolean).join(' ') }

function emailProviderUrl(email) {
  const domain = String(email || '').split('@')[1] || ''
  if (domain.includes('gmail.')) return 'https://mail.google.com/'
  if (domain.includes('yahoo.')) return 'https://mail.yahoo.com/'
  if (domain.includes('outlook.') || domain.includes('hotmail.') || domain.includes('live.')) {
    return 'https://outlook.live.com/mail'
  }
  return `mailto:${email}`
}

/* --------------------------- page --------------------------- */

export default function RegisterPage() {
  const router = useRouter()

  // form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [accept, setAccept] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ts, setTs] = useState(() => Date.now())       // simple anti-bot (time-on-page)
  const [hp, setHp] = useState('')                     // honeypot

  // detect timezone (client)
  const tz = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || null } catch { return null }
  }, [])

  // validations
  const emailOk = EMAIL_RE.test(email)
  const pwScore = scorePassword(password)
  const pwLenOk = password.length >= 12
  const pwCaseOk = /[a-z]/.test(password) && /[A-Z]/.test(password)
  const pwMixOk  = /\d/.test(password) || /[^A-Za-z0-9]/.test(password)
  const matchOk  = password && confirm && password === confirm

  const canSubmit = emailOk && pwLenOk && pwCaseOk && pwMixOk && matchOk && accept && !busy

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // basic anti-bot
    const dwell = Date.now() - ts
    if (hp || dwell < 800) { // honeypot filled or submitted too fast
      setError('Something went wrong. Please try again.')
      return
    }

    if (!canSubmit) return

    try {
      setBusy(true)
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name?.trim() || null,
          email: email.trim().toLowerCase(),
          password,
          timezone: tz, // server can use it or ignore
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Registration failed')
      }
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setBusy(false)
    }
  }

  // Google SSO
  async function handleGoogle() {
    setBusy(true)
    try {
      await signIn('google', { callbackUrl: '/user' })
    } finally {
      setBusy(false)
    }
  }

  // success view
  if (success) {
    return (
      <main className="mx-auto flex min-h-[100svh] w-full max-w-6xl items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-surface p-6 sm:p-8">
          <div className="absolute -top-28 -left-28 h-56 w-56 rounded-full bg-pink-600/20 blur-3xl" />
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs">Account created</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Verify your email
            </h1>
            <p className="mt-2 text-sm text-white/70">
              We’ve sent a verification link to <span className="font-medium text-white/90">{email}</span>.
              Open it to activate your account.
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <a
                href={emailProviderUrl(email)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pink-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-pink-700 transition"
              >
                Open email app <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/auth/signin"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white hover:bg-white/10 transition"
              >
                Back to sign in
              </Link>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-card p-4 text-sm text-white/70">
              <p className="mb-1 font-medium text-white/90">Didn’t get the email?</p>
              <ul className="list-disc pl-5">
                <li>Check your spam or promotions folder.</li>
                <li>Wait a couple of minutes — sometimes it’s delayed.</li>
                <li>Make sure you entered the correct email address.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-6xl items-center justify-center px-4 py-12">
      <div className="relative grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-surface md:grid-cols-[1.1fr,1fr]">
        {/* Left — form */}
        <div className="relative p-6 sm:p-8">
          <div className="absolute -top-28 -left-28 h-56 w-56 rounded-full bg-pink-600/20 blur-3xl" />
          <div className="relative z-10">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <Shield className="h-5 w-5 text-white/90" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">Create your account</h1>
                <p className="text-xs text-white/60">Start your mindful journey — it takes less than a minute.</p>
              </div>
            </div>

            {/* OAuth */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleGoogle}
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition disabled:opacity-60"
              >
                <img
                  width="32"
                  height="32"
                  alt="User"
                  className="rounded-full border border-secondary/60 object-cover h-8 w-8"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  referrerPolicy="no-referrer"
                  srcSet="/avatar-fallback-128.png 1x, /avatar-fallback-256.png 2x, /avatar-fallback-512.png 3x"
                  src="/avatar-fallback-128.png"
                />
                Continue with Google
              </button>
            </div>

            {/* Divider (mobile) */}
            <div className="my-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-white/50">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Honeypot (hidden) */}
              <input
                type="text"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                className="hidden"
                autoComplete="off"
                tabIndex={-1}
                aria-hidden
              />

              {/* Name (optional) */}
              <div>
                <label className="mb-1 block text-xs text-white/60">Name (optional)</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="How should we call you?"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-9 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
                    />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-xs text-white/60">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={cls(
                        'w-full rounded-xl border px-9 py-2.5 text-sm text-white placeholder:text-white/40 outline-none bg-white/5',
                        email
                          ? (emailOk ? 'border-emerald-500/40 focus:border-emerald-500/60' : 'border-red-500/40 focus:border-red-500/60')
                          : 'border-white/10 focus:border-white/20'
                      )}
                    />
                </div>
                {!emailOk && email && (
                  <p className="mt-1 text-xs text-red-300">Please enter a valid email address.</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="mb-1 block text-xs text-white/60">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      name="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-9 py-2.5 pr-10 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setShowPwd(s => !s) }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/60 hover:bg-white/10"
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                    >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* strength meter */}
                <div className="mt-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={cls(
                          'h-1.5 flex-1 rounded-full transition-all',
                          i < pwScore ? 'bg-emerald-400' : 'bg-white/10'
                        )}
                      />
                    ))}
                  </div>
                  <ul className="mt-2 grid grid-cols-1 gap-1 text-xs text-white/70 sm:grid-cols-3">
                    <li className="inline-flex items-center gap-1.5">
                      {pwLenOk ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <AlertTriangle className="h-3.5 w-3.5 text-white/40" />}
                      <span>12+ characters</span>
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      {pwCaseOk ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <AlertTriangle className="h-3.5 w-3.5 text-white/40" />}
                      <span>Upper & lower case</span>
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      {pwMixOk ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <AlertTriangle className="h-3.5 w-3.5 text-white/40" />}
                      <span>Number or symbol</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="mb-1 block text-xs text-white/60">Confirm password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      className={cls(
                        'w-full rounded-xl border px-9 py-2.5 text-sm text-white placeholder:text-white/40 outline-none bg-white/5',
                        confirm ? (matchOk ? 'border-emerald-500/40 focus:border-emerald-500/60' : 'border-red-500/40 focus:border-red-500/60') : 'border-white/10 focus:border-white/20'
                      )}
                    />
                </div>
                {confirm && !matchOk && (
                  <p className="mt-1 text-xs text-red-300">Passwords do not match.</p>
                )}
              </div>

              {/* Terms */}
              <label className="mt-1 inline-flex cursor-pointer items-center gap-2 text-xs text-white/70">
                <input
                  type="checkbox"
                  checked={accept}
                  onChange={(e) => setAccept(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 accent-pink-600"
                />
                I agree to the <Link href="/legal/terms" className="underline hover:text-white">Terms</Link> and <Link href="/legal/privacy" className="underline hover:text-white">Privacy Policy</Link>.
              </label>

              {/* Error */}
              {error ? (
                <div className="flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              ) : null}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={cls(
                  'inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition',
                  canSubmit
                    ? 'bg-pink-600 text-white shadow hover:bg-pink-700'
                    : 'bg-white/5 text-white/60 cursor-not-allowed'
                )}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Create account
              </button>

              {/* Footnote */}
              <p className="text-[11px] text-white/50">
                We never store plaintext passwords. We use industry-standard hashing (bcrypt).
              </p>
            </form>

            {/* Already have an account */}
            <p className="mt-6 text-center text-sm text-white/70">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-white underline underline-offset-4 hover:text-white">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Right — visual / reassurance */}
        <div className="relative hidden items-center justify-center bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 sm:flex md:p-8">
          <div className="absolute inset-0">
            <div className="absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-fuchsia-500/25 blur-3xl" />
            <div className="absolute right-10 bottom-10 h-40 w-40 rounded-full bg-cyan-400/25 blur-3xl" />
          </div>
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-card/70 p-5 backdrop-blur">
            <div className="mb-3 text-sm font-medium text-white/90">Why create an account?</div>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
                Personalized insights and badges.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
                Secure journal with end-to-end care.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
                Export your data when you need it.
              </li>
            </ul>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/70">
              <p className="mb-1 font-medium text-white/90">Security</p>
              <p>OAuth via Google, hashed credentials, and suspicious activity checks.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
