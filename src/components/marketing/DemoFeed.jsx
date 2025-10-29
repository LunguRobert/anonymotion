// src/components/marketing/DemoFeed.jsx
'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { reactionMap } from '@/lib/reactions'

/* ----------------------------- constants ----------------------------- */

const MOODS = ['ANXIOUS', 'NEUTRAL', 'HAPPY', 'ANGRY', 'SAD']
const emotionGradients = {
  NEUTRAL: 'linear-gradient(135deg,#64748b 0%,#94a3b8 100%)',
  HAPPY:   'linear-gradient(135deg,#ff80b5 0%,#ffb457 100%)',
  SAD:     'linear-gradient(135deg,#60a5fa 0%,#7c3aed 100%)',
  ANGRY:   'linear-gradient(135deg,#f43f5e 0%,#f59e0b 100%)',
  ANXIOUS: 'linear-gradient(135deg,#22d3ee 0%,#a78bfa 100%)',
}
const emotionIcons = {
  ANXIOUS: '/emotions/anxious.webp',
  NEUTRAL: '/emotions/neutral.webp',
  HAPPY:   '/emotions/happy.webp',
  ANGRY:   '/emotions/angry.webp',
  SAD:     '/emotions/sad.webp',
}

// fallback în caz că lipsesc din reactionMap
const FALLBACK_REACTIONS = [
  { name: 'like', file: '/reactions/neutral/reaction_like.webp' },
  { name: 'watch', file: '/reactions/neutral/reaction_watch.webp' },
  { name: 'think', file: '/reactions/neutral/reaction_think.webp' },
  { name: 'thinkclear', file: '/reactions/neutral/reaction_thinkclear.webp' },
]
const getReactionsForMood = (mood) => {
  const key = String(mood || '').toUpperCase()
  const list = reactionMap?.[key]
  return Array.isArray(list) && list.length ? list : FALLBACK_REACTIONS
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3) }

/** ținte pseudo-rand pentru animația count-up, în funcție de numele reacțiilor pentru mood-ul curent */
function randomTargets(mood) {
  const keys = getReactionsForMood(mood).map(r => r.name)
  const r = (a, b) => Math.floor(a + Math.random() * (b - a + 1))
  const base = r(3, 8)
  const out = Object.fromEntries(keys.map(k => [k, base]))
  // bias ușor spre primele două reacții (indiferent de mood)
  if (keys[0]) out[keys[0]] += r(3, 5)
  if (keys[1]) out[keys[1]] += r(2, 4)
  return out
}

/* ----------------------------- component ----------------------------- */

export default function DemoFeed() {
  // 2 postări sample pentru pașii 2–3, cu counts mapate pe cheile reale ale reacțiilor pentru mood-ul lor
  const samplePosts = useMemo(() => {
    const rxHappy = getReactionsForMood('HAPPY').map(r => r.name)
    const rxAnx   = getReactionsForMood('ANXIOUS').map(r => r.name)
    return [
      {
        id: 's1',
        emotion: 'HAPPY',
        content: 'Today I took a long walk with no phone. Felt light and present.',
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        counts: {
          [rxHappy[0] || 'love']: 9,
          [rxHappy[1] || 'smile']: 7,
          [rxHappy[2] || 'congrat']: 6,
          [rxHappy[3] || 'super']: 1,
        },
      },
      {
        id: 's2',
        emotion: 'ANXIOUS',
        content: 'Nervous about tomorrow. Writing it here actually calms me.',
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        counts: {
          [rxAnx[0] || 'imhere']: 5,
          [rxAnx[1] || 'understand']: 9,
          [rxAnx[2] || 'supportive']: 7,
          [rxAnx[3] || 'calm']: 1,
        },
      },
    ]
  }, [])

  /* wizard state */
  const [step, setStep] = useState(1) // 1..4
  const [content, setContent] = useState('')
  const [emotion, setEmotion] = useState('ANXIOUS')
  const [error, setError] = useState('')
  const [feed, setFeed] = useState(samplePosts)
  const [youReacted, setYouReacted] = useState(false)
  const animRAF = useRef(null)

  useEffect(() => () => cancelAnimationFrame(animRAF.current), [])

  /* ----------------------------- step actions ----------------------------- */

  // step 1: postezi
  function handlePost(e) {
    e.preventDefault()
    if (!content.trim()) { setError('Write a thought.'); return }
    if (!emotion) { setError('Select a mood.'); return }
    setError('')

    const id = 'new-' + Date.now()
    const newPost = {
      id,
      emotion,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      counts: Object.fromEntries(getReactionsForMood(emotion).map(r => [r.name, 0])),
      _targets: randomTargets(emotion),
    }
    setFeed(prev => [newPost, ...prev])
    setContent('')

    // animăm contorizarea ca „val de reacții” pe cheile corecte
    const keys = Object.keys(newPost._targets)
    const T = 1200
    const start = performance.now()
    cancelAnimationFrame(animRAF.current)
    const tick = (now) => {
      const t = Math.min(1, (now - start) / T)
      const p = easeOutCubic(t)
      setFeed(prev => prev.map(pst => {
        if (pst.id !== id) return pst
        const tgt = pst._targets
        const nextCounts = { ...pst.counts }
        keys.forEach(k => { nextCounts[k] = Math.floor((tgt[k] || 0) * p) })
        return { ...pst, counts: nextCounts }
      }))
      if (t < 1) animRAF.current = requestAnimationFrame(tick)
    }
    animRAF.current = requestAnimationFrame(tick)

    setTimeout(() => setStep(2), 500)
  }

  // step 3: reacționezi tu la o postare
  function handleReactOnSample(name) {
    if (youReacted) return
    setFeed(prev => prev.map(p => {
      if (p.id !== 's2') return p
      const n = Math.min(99, (p.counts?.[name] || 0) + 1)
      return { ...p, counts: { ...p.counts, [name]: n } }
    }))
    setYouReacted(true)
  }

  function resetDemo() {
    setStep(1)
    setContent('')
    setEmotion('ANXIOUS')
    setError('')
    setYouReacted(false)
    setFeed(samplePosts)
  }

  /* ----------------------------- layout ----------------------------- */

  const steps = [
    { id: 1, title: 'Post a thought',    desc: 'Write how you feel and pick a mood.' },
    { id: 2, title: 'See reactions',     desc: 'Watch supportive reactions roll in.' },
    { id: 3, title: 'React to a post',   desc: 'Tap a reaction to cheer someone.' },
    { id: 4, title: 'Understand patterns', desc: 'Get gentle insights from your month.' },
  ]
  const canNext = (step === 1 ? !!feed.find(p=>p.id.startsWith('new-')) : step === 3 ? youReacted : true)
  const canBack = step > 1

  return (
    <section aria-labelledby="demo-feed" className="mx-auto max-w-7xl px-6 py-14 md:py-20">
      <div className="relative rounded-[1.75rem] border-anim">
        <div className="rounded-[1.65rem] bg-surface/60 border border-secondary/60">
          <div className="px-6 py-8 md:py-10">

            {/* header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="demo-feed" className="text-2xl md:text-3xl font-semibold text-inverted">
                  How it works — try it live
                </h2>
                <p className="mt-1 max-w-2xl text-muted">
                  A guided mini-demo: post, see reactions, react yourself, then preview insights.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetDemo}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10 transition"
                >
                  Restart demo
                </button>
                <Link
                  href="/feed"
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white hover:bg-white/10 transition"
                >
                  Skip intro
                </Link>
              </div>
            </div>

            {/* stepper */}
            <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {steps.map(s => {
                const active = step === s.id
                const done = step > s.id
                return (
                  <li key={s.id} className="flex items-center gap-3">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold
                      ${done ? 'bg-primary text-slate-900' : active ? 'bg-white text-slate-900' : 'bg-white/10 text-white/70'}`}>
                      {s.id}
                    </span>
                    <div>
                      <div className={`text-sm font-medium ${active ? 'text-inverted' : 'text-white/80'}`}>{s.title}</div>
                      <div className="text-[11px] text-muted hidden sm:block">{s.desc}</div>
                    </div>
                  </li>
                )
              })}
            </ol>

            {/* body */}
            <div className="mt-6">
              {step === 1 && <Step1Post
                content={content}
                setContent={setContent}
                emotion={emotion}
                setEmotion={setEmotion}
                error={error}
                onSubmit={handlePost}
              />}

              {step === 2 && <Step2Reactions feed={feed} />}

              {step === 3 && <Step3React feed={feed} onReact={handleReactOnSample} youReacted={youReacted} />}

              {step === 4 && <Step4Insights />}
            </div>

            {/* nav */}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[11px] text-muted">
                Anonymous by default • You can delete or edit in the real app
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep(s => Math.max(1, s - 1))}
                  disabled={!canBack}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition disabled:opacity-60"
                >
                  Back
                </button>
                {step < 4 ? (
                  <button
                    onClick={() => canNext && setStep(s => Math.min(4, s + 1))}
                    disabled={!canNext}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-slate-900 shadow hover:opacity-90 transition disabled:opacity-50"
                  >
                    Next
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/feed"
                      className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white hover:bg-white/10 transition"
                    >
                      Explore the feed
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* scoped css */}
      <style>{`
        .border-anim { position: relative; }
        .border-anim::before {
          content: "";
          position: absolute; inset: 0; border-radius: inherit; padding: 2px;
          background: conic-gradient(from var(--a, 0deg),
            rgba(34,211,238,.35), rgba(192,132,252,.35), rgba(249,168,212,.28), rgba(34,211,238,.35));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          pointer-events: none; z-index: 0; animation: spin-angle 18s linear infinite;
        }
        @property --a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
        @keyframes spin-angle { to { --a: 360deg; } }
        .clamp-6 { display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; }
        .emoji-pop { animation: pop .35s cubic-bezier(.2,.8,.2,1) }
        @keyframes pop { 0%{transform:scale(.9);opacity:0} 60%{transform:scale(1.06);opacity:.95} 100%{transform:scale(1);opacity:1} }
      `}</style>
    </section>
  )
}

/* ----------------------------- steps ----------------------------- */

function Step1Post({ content, setContent, emotion, setEmotion, error, onSubmit }) {
  const charsLeft = 260 - content.length
  const disabled = !content.trim()
  return (
    <div className="rounded-2xl border border-secondary/60 bg-card/50 p-4 backdrop-blur relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -inset-1 rounded-[1.25rem] opacity-40 blur-2xl"
           style={{ background: 'conic-gradient(from 180deg at 50% 50%, rgba(34,211,238,.15), rgba(192,132,252,.15), rgba(249,168,212,.12), rgba(34,211,238,.15))' }} />
      <div className="relative">
        <h3 className="text-inverted font-semibold">Step 1 — Post a thought</h3>
        <p className="text-[13px] text-muted">Pick a mood, write something short, then hit Post.</p>

        {/* chips */}
        <fieldset className="mt-3">
          <legend className="sr-only">Pick mood</legend>
          <div className="flex flex-wrap items-center gap-2">
            {MOODS.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setEmotion(m)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition
                ${emotion === m ? 'border-accent ring-1 ring-accent bg-surface/60 text-inverted' : 'border-secondary/60 bg-surface/40 text-inverted/90 hover:text-inverted'}`}
                aria-pressed={emotion === m}
                title={m}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={emotionIcons[m]} alt="" className="h-5 w-5 object-contain" />
                {m}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-muted">Anonymous • {charsLeft} left</span>
          </div>
        </fieldset>

        {/* input */}
        <form onSubmit={onSubmit} className="mt-3 relative">
          <label htmlFor="demo-thought" className="sr-only">Your thought</label>
          <textarea
            id="demo-thought"
            rows={2}
            maxLength={260}
            value={content}
            onChange={(e)=>setContent(e.target.value)}
            placeholder="Write how you feel…"
            className="w-full rounded-full border border-secondary bg-surface px-6 py-3 pr-28 text-inverted placeholder:text-muted focus:outline-none focus:ring-2 ring-primary resize-none"
          />
          <button
            type="submit"
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-slate-900 hover:opacity-90 transition disabled:opacity-50"
          >
            Post
          </button>
        </form>
        {error && <p className="mt-2 text-xs text-danger" role="alert">{error}</p>}
      </div>
    </div>
  )
}

function Step2Reactions({ feed }) {
  const newest = feed.find(p => p.id.startsWith('new-')) || feed[0]
  const needsClamp = newest.content.length > 260
  const reactions = getReactionsForMood(newest.emotion)

  return (
    <div className="grid gap-5 md:grid-cols-[1.2fr_.8fr]">
      {/* card post + reacții */}
      <article className="relative h-full rounded-3xl border border-secondary bg-card shadow-sm transition pb-2">
        <div aria-hidden className="pointer-events-none absolute -inset-0.5 -z-10 rounded-[1.75rem] opacity-40 blur-2xl"
             style={{ background: 'conic-gradient(from 160deg at 50% 50%, rgba(34,211,238,.14), rgba(109,40,217,.14), rgba(249,168,212,.1), rgba(34,211,238,.14))' }} />
        <div className="m-3 rounded-2xl p-5 text-white select-text min-h-[160px] sm:min-h-[180px] flex flex-col"
             style={{ background: emotionGradients[newest.emotion] || emotionGradients.NEUTRAL }}>
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded-full bg-black/25 px-2 py-0.5 text-xs">#{newest.emotion}</span>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs text-white/90">Your post</span>
          </div>
          <div className={`${needsClamp ? 'clamp-6' : ''} whitespace-pre-wrap text-base leading-relaxed`}>
            {newest.content}
          </div>
          <div className="mt-auto pt-4 text-right text-[11px] text-white/85">{timeAgo(newest.createdAt)}</div>
        </div>
        <div className="px-4 pb-4">
          <div className="flex flex-wrap items-center justify-center gap-5">
            {reactions.map(({ name, file })=>{
              const n = newest.counts?.[name] || 0
              return (
                <div key={name+'-'+n} className="relative text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file} alt={`${name} reaction`} className="h-7 w-7 object-contain emoji-pop" />
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted tabular-nums">{n}</span>
                </div>
              )
            })}
          </div>
        </div>
      </article>

      {/* tip box */}
      <div className="rounded-2xl border border-secondary/60 bg-card/60 p-5">
        <h4 className="text-inverted font-semibold">Step 2 — Reactions happen</h4>
        <p className="mt-2 text-sm text-muted">
          People respond with gentle reactions suited to your mood. No comments, no arguing — just quick signals.
        </p>
        <ul className="mt-3 list-disc pl-5 text-sm text-muted">
          <li>Counts animate in as your post gets seen.</li>
          <li>Your profile is never shown in public.</li>
        </ul>
      </div>
    </div>
  )
}

function Step3React({ feed, onReact, youReacted }) {
  const target = feed.find(p => p.id === 's2') || feed[0]
  const reactions = getReactionsForMood(target.emotion)

  return (
    <div className="grid gap-5 md:grid-cols-[1.2fr_.8fr]">
      <article className="relative h-full rounded-3xl border border-secondary bg-card shadow-sm transition pb-2">
        <div aria-hidden className="pointer-events-none absolute -inset-0.5 -z-10 rounded-[1.75rem] opacity-40 blur-2xl"
             style={{ background: 'conic-gradient(from 160deg at 50% 50%, rgba(34,211,238,.14), rgba(109,40,217,.14), rgba(249,168,212,.1), rgba(34,211,238,.14))' }} />
        <div className="m-3 rounded-2xl p-5 text-white select-text min-h-[160px] sm:min-h-[180px] flex flex-col"
             style={{ background: emotionGradients[target.emotion] || emotionGradients.NEUTRAL }}>
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded-full bg-black/25 px-2 py-0.5 text-xs">#{target.emotion}</span>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs text-white/90">Someone else</span>
          </div>
          <div className="whitespace-pre-wrap text-base leading-relaxed">
            {target.content}
          </div>
          <div className="mt-auto pt-4 text-right text-[11px] text-white/85">{timeAgo(target.createdAt)}</div>
        </div>

        {/* reacționezi TU aici */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap items-center justify-center gap-5">
            {reactions.map(({ name, file })=>{
              const n = target.counts?.[name] || 0
              return (
                <button
                  key={name}
                  onClick={() => onReact(name)}
                  className="relative text-center rounded-lg p-1 hover:bg-white/10 transition"
                  aria-label={`React ${name}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file} alt={`${name} reaction`} className="h-7 w-7 object-contain" />
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted tabular-nums">{n}</span>
                </button>
              )
            })}
          </div>
          {youReacted ? (
            <p className="mt-5 text-center text-sm text-emerald-300">Nice — your reaction is counted 💫</p>
          ) : (
            <p className="mt-5 text-center text-sm text-muted">Tap any reaction to continue.</p>
          )}
        </div>
      </article>

      {/* tip box */}
      <div className="rounded-2xl border border-secondary/60 bg-card/60 p-5">
        <h4 className="text-inverted font-semibold">Step 3 — Give support</h4>
        <p className="mt-2 text-sm text-muted">
          Reactions match the mood of the post — tap once, help someone feel seen.
        </p>
        <ul className="mt-3 list-disc pl-5 text-sm text-muted">
          <li>No public profile attached to reactions.</li>
          <li>We show counts, not who reacted.</li>
        </ul>
      </div>
    </div>
  )
}

function Step4Insights() {
  const metrics = [
    { label: 'Support', color: '#22d3ee', value: 72 },
    { label: 'Calm',    color: '#c084fc', value: 58 },
    { label: 'Energy',  color: '#f9a8d4', value: 31 },
  ]
  return (
    <div className="grid gap-5 md:grid-cols-[1.2fr_.8fr]">
      <div className="rounded-2xl border border-secondary/60 bg-card/60 p-5">
        <h4 className="text-inverted font-semibold">Step 4 — See your patterns</h4>
        <p className="mt-2 text-sm text-muted">
          Your private stats turn posts into gentle insights. Notice mood trends, celebrate streaks,
          and view your monthly constellation.
        </p>

        {/* mini metrics bars */}
        <div className="mt-5 grid grid-cols-3 gap-3 md:gap-4">
          {metrics.map(m => (
            <div key={m.label} className="flex flex-col items-center">
              <div className="relative h-20 w-7 overflow-hidden rounded-md border border-secondary/50 bg-surface/70 md:h-24 md:w-8">
                <div aria-hidden className="absolute inset-0"
                     style={{ background: 'repeating-linear-gradient(to top, rgba(255,255,255,.06) 0 1px, transparent 1px 8px)' }} />
                <div className="absolute bottom-0 left-0 w-full origin-bottom animate-metric-fill"
                     style={{
                       height: `${m.value}%`,
                       background: `linear-gradient(to top, ${m.color}, rgba(255,255,255,.05))`,
                       boxShadow: `0 0 10px 0 ${m.color}33 inset`,
                     }} />
              </div>
              <div className="mt-2 text-center">
                <div className="text-[11px] text-muted md:text-xs">{m.label}</div>
                <div className="text-sm font-semibold text-inverted tabular-nums">{m.value}%</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted md:text-xs">Keep posting — insights feel better with time.</p>

        <style>{`
          @keyframes metric-fill { from { transform: scaleY(0); } to { transform: scaleY(1); } }
          .animate-metric-fill { animation: metric-fill .9s cubic-bezier(.22,.8,.25,1) both; }
        `}</style>
      </div>

      {/* CTA card */}
      <div className="rounded-2xl border border-secondary/60 bg-card/60 p-5">
        <h4 className="text-inverted font-semibold">Ready to try for real?</h4>
        <p className="mt-2 text-sm text-muted">
          Sign in to post in the real feed, collect reactions, and unlock your private stats.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-slate-900 shadow hover:opacity-90 transition"
          >
            Start free — post in 10s
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white hover:bg-white/10 transition"
          >
            See Premium
          </Link>
        </div>
      </div>
    </div>
  )
}
