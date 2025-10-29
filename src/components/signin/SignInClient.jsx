// app/auth/signin/SignInClient.jsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import {
  Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle,
  Loader2, ArrowRight, Check, Info, LogIn, AlertTriangle
} from 'lucide-react'

function cls(...p){ return p.filter(Boolean).join(' ') }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignInClient() {
  const router = useRouter()
  const qp = useSearchParams()
  const callbackUrl = qp.get('callbackUrl') || '/user'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [caps, setCaps] = useState(false)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [ts] = useState(() => Date.now())   // simple time-on-page gate
  const [hp, setHp] = useState('')          // honeypot

  const emailOk = useMemo(() => EMAIL_RE.test(email), [email])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setInfo('')

    // anti-bot: honeypot sau trimis prea repede
    if (hp || Date.now() - ts < 600) {
      setError('Something went wrong. Please try again.')
      return
    }
    if (!emailOk || !password) {
      setError('Please fill your email and password.')
      return
    }

    try {
      setBusy(true)
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
        callbackUrl,
      })
      if (res?.error) {
        setError('Invalid credentials or email not verified.')
        return
      }
      if (res?.ok) {
        router.push(res.url || callbackUrl)
      } else {
        setError('Sign-in failed. Please try again.')
      }
    } catch (err) {
      setError('Unexpected error. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setBusy(true)
    try {
      await signIn('google', { callbackUrl })
    } finally {
      setBusy(false)
    }
  }

  async function handleResend() {
    setError(''); setInfo('')
    try {
      const res = await fetch('/api/auth/send-verification', { method: 'POST' })
      if (res.status === 401) { setError('Sign in with Google first or register your email.'); return }
      if (res.status === 429) { setError('Please wait before requesting again.'); return }
      const data = await res.json().catch(() => ({}))
      if (data.alreadyVerified) setInfo('Your email is already verified.')
      else setInfo('Verification email sent. Check your inbox.')
    } catch {
      setError('Could not send verification email.')
    }
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
                <ShieldCheck className="h-5 w-5 text-white/90" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">Welcome back</h1>
                <p className="text-xs text-white/60">Sign in to continue your mindful journey.</p>
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
              {/* honeypot */}
              <input
                type="text"
                value={hp}
                onChange={(e)=>setHp(e.target.value)}
                className="hidden"
                tabIndex={-1}
                aria-hidden
                autoComplete="off"
              />

              {/* email */}
              <div>
                <label className="mb-1 block text-xs text-white/60">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={cls(
                      'w-full rounded-xl border px-9 py-2.5 text-sm text-white placeholder:text-white/40 outline-none bg-white/5',
                      email
                        ? (emailOk ? 'border-white/20 focus:border-white/30' : 'border-red-500/40 focus:border-red-500/60')
                        : 'border-white/10 focus:border-white/20'
                    )}
                    autoComplete="email"
                    required
                  />
                </div>
                {!emailOk && email && (
                  <p className="mt-1 text-xs text-red-300">Please enter a valid email address.</p>
                )}
              </div>

              {/* password */}
              <div>
                <label className="mb-1 block text-xs text-white/60">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    onKeyUp={(e)=>setCaps(e.getModifierState && e.getModifierState('CapsLock'))}
                    placeholder="Your password"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-9 py-2.5 pr-10 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/20"
                    autoComplete="current-password"
                    required
                  />
                    <button
                      type="button"
                      onClick={(e)=>{ e.preventDefault(); setShowPwd(s=>!s) }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/60 hover:bg-white/10"
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                    >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {caps && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-200">
                    <AlertTriangle className="h-3.5 w-3.5" /> Caps Lock is on
                  </div>
                )}
              </div>

              {/* error / info */}
              {error ? (
                <div className="flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              ) : null}
              {info ? (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                  <Check className="h-4 w-4" />
                  <span>{info}</span>
                </div>
              ) : null}

              {/* actions */}
              <button
                type="submit"
                disabled={busy || !emailOk || !password}
                className={cls(
                  'inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition',
                  busy || !emailOk || !password
                    ? 'bg-white/5 text-white/60 cursor-not-allowed'
                    : 'bg-pink-600 text-white shadow hover:bg-pink-700'
                )}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                Sign in
              </button>

              <div className="mt-2 flex flex-col items-center justify-between gap-2 text-xs text-white/70 sm:flex-row">
                <Link href="/auth/forgot" className="text-blue-600 hover:underline">Forgot password?</Link>
                <button
                  type="button"
                  onClick={handleResend}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 hover:bg-white/10"
                  title="Resend verification email"
                >
                  <Info className="h-3.5 w-3.5" /> Resend verification email
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-white/70">
                New here?{' '}
                <Link href="/auth/register" className="text-white underline underline-offset-4 hover:text-white">
                  Create an account
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right — reassurance / features */}
        <div className="relative hidden items-center justify-center bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 sm:flex md:p-8">
          <div className="absolute inset-0">
            <div className="absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-fuchsia-500/25 blur-3xl" />
            <div className="absolute right-10 bottom-10 h-40 w-40 rounded-full bg-cyan-400/25 blur-3xl" />
          </div>
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-card/70 p-5 backdrop-blur">
            <div className="mb-3 text-sm font-medium text-white/90">Good to see you again</div>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
                Your private space — secure and synced.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
                Keep progress, badges, and insights in one place.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
                Export whenever you need a snapshot.
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