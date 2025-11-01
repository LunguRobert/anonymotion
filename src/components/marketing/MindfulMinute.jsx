'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

const MODES = {
  '478': {
    key: '478',
    name: '4-7-8',
    steps: [
      { name: 'Inhale', secs: 4, kind: 'in' },
      { name: 'Hold',   secs: 7, kind: 'hold' },
      { name: 'Exhale', secs: 8, kind: 'out' },
    ],
  },
  box: {
    key: 'box',
    name: 'Box',
    steps: [
      { name: 'Inhale', secs: 4, kind: 'in' },
      { name: 'Hold',   secs: 4, kind: 'hold' },
      { name: 'Exhale', secs: 4, kind: 'out' },
      { name: 'Hold',   secs: 4, kind: 'hold' },
    ],
  },
  coh: {
    key: 'coh',
    name: 'Coherent',
    steps: [
      { name: 'Inhale', secs: 5, kind: 'in' },
      { name: 'Exhale', secs: 5, kind: 'out' },
    ],
  },
}

export default function MindfulMinute() {
  const [modeKey, setModeKey] = useState('478')
  const mode = useMemo(() => MODES[modeKey], [modeKey])

  const totalSecs = useMemo(
    () => mode.steps.reduce((s, x) => s + x.secs, 0),
    [mode]
  )

  const [running, setRunning] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [phaseElapsed, setPhaseElapsed] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [showDone, setShowDone] = useState(false)

  // —— refs pentru timing robust (fără skip de faze)
  const raf = useRef(0)
  const lastTs = useRef(0)
  const phaseIdxRef = useRef(phaseIdx)
  const phaseElapsedRef = useRef(phaseElapsed)

  useEffect(() => { phaseIdxRef.current = phaseIdx }, [phaseIdx])
  useEffect(() => { phaseElapsedRef.current = phaseElapsed }, [phaseElapsed])

  // derived
  const phase = mode.steps[phaseIdx]
  const phaseLeft = Math.max(0, Math.ceil(phase.secs - phaseElapsed))

  const totalElapsed = useMemo(() => {
    let s = 0
    for (let i = 0; i < phaseIdx; i++) s += mode.steps[i].secs
    return s + Math.min(phaseElapsed, phase.secs)
  }, [mode, phaseIdx, phaseElapsed])

  const progressTotal = totalElapsed / totalSecs

  function dotScale(kind, t) {
    const base = 0.82
    const max  = 1.06
    if (kind === 'in')   return base + (max - base) * t
    if (kind === 'out')  return max  - (max - base) * t
    return max // hold rămâne “plin”
  }

  // —— bucla de timp cu “carry” (fix pentru skip la HOLD)
  useEffect(() => {
    if (!running) return

    function tick(ts) {
      if (!lastTs.current) lastTs.current = ts
      let dt = (ts - lastTs.current) / 1000
      lastTs.current = ts

      // lucrăm pe copii locale + refs, apoi setăm state o singură dată
      let idx = phaseIdxRef.current
      let elapsed = phaseElapsedRef.current + dt
      const steps = mode.steps
      const lastIdx = steps.length - 1

      // procesează toate trecerile de fază din acest frame
      while (elapsed >= steps[idx].secs) {
        elapsed -= steps[idx].secs
        if (idx === lastIdx) {
          // ciclu complet
          cancelAnimationFrame(raf.current)
          setRunning(false)
          setCycleCount(c => c + 1)
          setShowDone(true)
          setPhaseIdx(0)
          setPhaseElapsed(0)
          phaseIdxRef.current = 0
          phaseElapsedRef.current = 0
          lastTs.current = 0
          return // IMPORTANT: nu mai cerem următorul frame
        } else {
          idx += 1 // trece la faza următoare (nu sărim nimic)
        }
      }

      // actualizează state & refs sincron
      phaseIdxRef.current = idx
      phaseElapsedRef.current = elapsed
      setPhaseIdx(idx)
      setPhaseElapsed(elapsed)

      raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [running, modeKey]) // reatașăm bucla dacă se schimbă modul sau start/pause

  // tastatură: Space = toggle
  useEffect(() => {
    function onKey(e) {
      if (e.code === 'Space') {
        e.preventDefault()
        setRunning(r => !r)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // reset pe schimbare mod
  useEffect(() => {
    setRunning(false)
    setPhaseIdx(0)
    setPhaseElapsed(0)
    setShowDone(false)
    phaseIdxRef.current = 0
    phaseElapsedRef.current = 0
    lastTs.current = 0
  }, [modeKey])

  // visuals
  const phaseProgress = Math.min(1, phaseElapsed / phase.secs)
  const scale = dotScale(phase.kind, phaseProgress)
  const ringGlow = 16 + (10 * (phase.kind === 'hold' ? 1 : phaseProgress))
  const phaseBadges = mode.steps.map((s, i) => ({
    label: `${s.name} ${s.secs}s`,
    active: i === phaseIdx && running,
    done: i < phaseIdx || (!running && (i < phaseIdx || (i === phaseIdx && phaseElapsed > 0))),
  }))
  // câte coloane în grilă, în funcție de nr. de pași
  const badgeCols = [
    'grid-cols-1',                                    // mobile: 1/row
    'sm:grid-cols-2',                                 // ≥640px: 2/row
    mode.steps.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2', // ≥768px: 3/row doar la 3+ pași
    mode.steps.length >= 4 ? 'lg:grid-cols-4' : ''    // ≥1024px: 4/row la 4 pași (Box)
  ].join(' ')


  // status text pe card (now / paused / done / up next)
  function badgeStatus(i) {
    if (i === phaseIdx) return running ? 'now' : (phaseElapsed > 0 ? 'paused' : 'up next')
    return i < phaseIdx ? 'done' : 'up next'
  }

  function startPause() {
    if (showDone) setShowDone(false)
    lastTs.current = 0
    setRunning(r => !r)
  }
  function restart() {
    cancelAnimationFrame(raf.current)
    lastTs.current = 0
    setPhaseIdx(0); setPhaseElapsed(0)
    phaseIdxRef.current = 0; phaseElapsedRef.current = 0
    setShowDone(false)
    setRunning(true)
  }
  function stop() {
    cancelAnimationFrame(raf.current)
    setRunning(false)
    setPhaseIdx(0); setPhaseElapsed(0)
    phaseIdxRef.current = 0; phaseElapsedRef.current = 0
    lastTs.current = 0
  }

  return (
    <section aria-labelledby="mm-title" className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-6 flex items-end justify-between">
        <h2 id="mm-title" className="text-2xl md:text-3xl font-semibold">Mindful minute</h2>
        <div className="text-xs text-muted">One full cycle gives you gentle feedback.</div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-secondary/60 bg-card/60 p-5 md:p-6">
        {/* controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:justify-between">
        <div className="flex items-center justify-center gap-2 rounded-xl border border-secondary/60 bg-surface/60 p-1">
          {Object.values(MODES).map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setModeKey(m.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                modeKey === m.key
                  ? "bg-primary text-inverted ring-1 ring-primary"
                  : "text-inverted/90 hover:text-inverted"
              }`}
              aria-pressed={modeKey === m.key}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="mt-2 w-full justify-center md:mt-0 md:w-auto md:ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={startPause}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-inverted ring-primary transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
              {running ? (
                <g>
                  <rect x="6" y="5" width="4" height="14" />
                  <rect x="14" y="5" width="4" height="14" />
                </g>
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
            {running ? "Pause" : totalElapsed > 0 && !showDone ? "Resume" : "Start"}
          </button>

          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-xl border border-secondary/60 bg-surface/60 px-3 py-2 text-sm font-medium hover:text-inverted focus-visible:outline-none focus-visible:ring-2 ring-accent"
          >
            Restart
          </button>

          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-xl border border-secondary/60 bg-surface/60 px-3 py-2 text-sm font-medium hover:text-inverted focus-visible:outline-none focus-visible:ring-2 ring-accent"
          >
            Stop
          </button>
        </div>
      </div>


        {/* coach + badges */}
        <div className="mt-6 grid items-center gap-6 md:grid-cols-2">
          <div className="mmx-coach ios-square relative mx-auto aspect-square w-full max-w-[420px] rounded-3xl border border-secondary/60 bg-surface/60 p-6">
            <div className="mmx-ring absolute inset-6 rounded-full" aria-hidden="true"
                 style={{ background: `conic-gradient(var(--color-accent) ${progressTotal*360}deg, rgba(255,255,255,.08) 0)` }} />
            <div className="absolute inset-[3.25rem] rounded-full bg-card/50 border border-secondary/40" />

            <div className="relative grid h-full place-items-center">
              <div
                className="mmx-dot rounded-full"
                aria-hidden="true"
                style={{
                  transform: `scale(${scale})`,
                  boxShadow: `inset 0 0 0 ${16 + (10 * (phase.kind === 'hold' ? 1 : phaseProgress))}px color-mix(in oklab, var(--color-accent) 16%, transparent), 0 10px 30px rgba(0,0,0,.35)`,
                }}
              />
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center text-sm text-inverted/90" role="status" aria-live="polite">
                  <div className="text-xs text-muted mb-1">{mode.name}</div>
                  <div className="text-lg font-semibold">
                    {phase.name} <span className="text-muted">·</span> {String(phaseLeft).padStart(2, '0')}s
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    Cycle {cycleCount} · Total {totalSecs}s
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* badges + tips */}
          <div>
            {/* Badges dinamice din mode.steps */}
            <div className={`grid ${badgeCols} gap-3`}>
              {mode.steps.map((s, i) => {
                const status = badgeStatus(i)
                const isActive = i === phaseIdx
                const isDone = i < phaseIdx

                return (
                  <div
                    key={`${s.name}-${s.secs}-${i}`}
                    className={[
                      'rounded-xl border border-secondary/60 bg-card/30 p-2.5 md:p-3 min-w-0',
                      'text-[13px] md:text-sm leading-5 md:leading-6',
                      isActive ? 'ring-1 ring-accent/70' : '',
                      isDone ? 'opacity-90' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium tracking-tight tabular-nums">
                        {s.name} {s.secs}s
                      </span>
                      <span className="shrink-0 text-[10px] md:text-[11px] text-muted">
                        {status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tips (rămân la fel) */}
            <ul className="mt-4 space-y-2 text-[13px] text-muted">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
                Breathe into the belly; shoulders relaxed.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
                If thoughts appear, notice and return to breath.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
                One minute is enough. Repeat if helpful.
              </li>
            </ul>
          </div>

        </div>

        {/* overlay “done” */}
        {showDone && (
          <div className="mmx-done pointer-events-auto">
            <div className="mmx-card">
              <div className="text-sm font-semibold text-inverted">Nice job — cycle complete</div>
              <p className="mt-1 text-xs text-muted">You just finished a {mode.name.toLowerCase()} cycle.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-inverted" onClick={restart}>
                  Do another minute
                </button>
                <button
                  className="rounded-lg border border-secondary/60 bg-surface/60 px-3 py-2 text-sm font-medium hover:text-inverted focus-visible:outline-none focus-visible:ring-2 ring-accent"
                  onClick={() => { setShowDone(false); setRunning(false) }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .mmx-coach { position: relative; }
          .mmx-ring { pointer-events:none; }
          .mmx-dot {
            width: 30%; height: 30%;
            background:
              radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--color-accent) 45%, transparent), transparent 70%),
              linear-gradient(to bottom right, rgba(255,255,255,.06), rgba(0,0,0,.14));
            border: 1px solid color-mix(in oklab, var(--color-secondary) 70%, transparent);
            border-radius: 9999px;
            transition: transform .12s ease;
          }
          .mmx-done {
            position: absolute; inset: 0; display: grid; place-items: center;
            background: radial-gradient(60% 60% at 50% 50%, rgba(0,0,0,.35), transparent 70%);
          }
          .mmx-card {
            border-radius: 1rem; padding: 1rem;
            background: color-mix(in oklab, var(--color-surface) 92%, transparent);
            border: 1px solid var(--color-secondary);
            box-shadow: 0 10px 40px rgba(0,0,0,.35);
            backdrop-filter: blur(6px);
            max-width: 360px; width: 100%;
          }
          @media (prefers-reduced-motion: reduce) {
            .mmx-dot { transition: none !important; }
          }
        `}</style>
      </div>
    </section>
  )
}
