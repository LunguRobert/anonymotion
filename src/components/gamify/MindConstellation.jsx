'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { RefreshCcw, Sparkles } from 'lucide-react'

export default function MindConstellation({
  logoSrc,
  watermarkText = 'Mind Constellation',
  quote,
  quoteAuthor,
  logoScale = 1
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [logoImg, setLogoImg] = useState(null)

  useEffect(() => {
    if (!logoSrc) { setLogoImg(null); return }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setLogoImg(img)
    img.onerror = () => setLogoImg(null)
    img.src = logoSrc
  }, [logoSrc])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true); setError('')
        const now = new Date()
        const month = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
        const qs = new URLSearchParams({ layout:'rings', mode:'month', month, v:String(refreshKey) })
        const res = await fetch(`/api/gamify/constellation?${qs}`, { cache:'no-store' })
        const ct = res.headers.get('content-type') || ''
        if (!ct.includes('application/json')) throw new Error(`Bad response (${res.status})`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || `Bad response (${res.status})`)
        if (!alive) return
        setData(json)
      } catch (e) {
        if (!alive) return
        setError(e.message || 'Failed to load constellation')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [refreshKey])

  const colors = data?.colors || {
    HAPPY:'#facc15', NEUTRAL:'#a3a3a3', SAD:'#60a5fa', ANGRY:'#f87171', ANXIOUS:'#c084fc', NONE:'#9ca3af'
  }
  const score  = data?.meta?.score ?? 0
  const monthKey = data?.key || ''
  const predominant = data?.meta?.predominantMood || 'NEUTRAL'
  const q  = (data?.meta?.quote?.text   ?? quote)       || defaultQuoteFor(predominant).text
  const qA = (data?.meta?.quote?.author ?? quoteAuthor) || ''

  return (
    <section className="relative overflow-hidden rounded-3xl border border-secondary bg-surface p-4 sm:p-6">
      <div className="glow-lamp absolute inset-0" />
      <div className="relative z-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white">
              Mind Constellation — <span className="text-white/80">{monthKey || 'Last Month'}</span>
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Stars from your entries. Colored rings by mood. Lines connect streak days.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition"
              title="Refresh"
            >
              <RefreshCcw className="h-4 w-4" /> Refresh
            </button>
            <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Brightness:</span>
              <span className="font-semibold tabular-nums">{Math.round(score)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-secondary bg-card p-3 text-center text-sm text-red-300 mb-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="aspect-[4/5] md:aspect-[10/7] w-full rounded-2xl bg-white/10 animate-pulse" />
        ) : (
          <RingsCanvas
            data={data}
            colors={colors}
            logoImg={logoImg}
            watermarkText={watermarkText}
            quote={q}
            quoteAuthor={qA}
            logoScale={logoScale}
            logoSrc={logoSrc}
          />
        )}
      </div>
    </section>
  )
}

/* ==================== Canvas renderer with adaptive footer modes ==================== */

function RingsCanvas({ data, colors, logoImg, watermarkText, quote, quoteAuthor, logoScale, logoSrc }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  const ringDefs  = data?.rings || {}
  const ringOrder = ['HAPPY','NEUTRAL','SAD','ANGRY','ANXIOUS'].filter(m => ringDefs[m])
  const starsData = (data?.stars || []).slice().sort((a,b) => new Date(a.ts) - new Date(b.ts))
  const seed      = data?.meta?.seed || 1

  const bgStars = useMemo(() => makeDeepStarfield(seed), [seed])

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })

    const resize = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawStatic(ctx, w, h)
    }

    const drawStatic = (ctx, w, h) => {
      ctx.clearRect(0,0,w,h)

      const g = ctx.createLinearGradient(0,0,0,h)
      g.addColorStop(0, '#0b1020'); g.addColorStop(1, '#0e1428')
      ctx.fillStyle = g; ctx.fillRect(0,0,w,h)

      // nebula
      const cxN = w * 0.70, cyN = h * 0.25
      const rxN = w * 0.62, ryN = h * 0.60
      ctx.save()
      ctx.beginPath(); ctx.ellipse(cxN, cyN, rxN, ryN, 0, 0, Math.PI*2); ctx.clip()
      const neb = ctx.createRadialGradient(cxN, cyN, 0, cxN, cyN, Math.max(rxN, ryN))
      neb.addColorStop(0.00, 'rgba(109,40,217,0.22)')
      neb.addColorStop(0.60, 'rgba(34,211,238,0.12)')
      neb.addColorStop(1.00, 'rgba(14,20,40,0.00)')
      ctx.fillStyle = neb
      ctx.fillRect(cxN - rxN - 2, cyN - ryN - 2, rxN*2 + 4, ryN*2 + 4)
      ctx.restore()

      // starfield + dust
      drawStarLayer(ctx, bgStars.far,  w, h, 0.35)
      drawStarLayer(ctx, bgStars.mid,  w, h, 0.55)
      drawStarLayer(ctx, bgStars.near, w, h, 0.85)
      drawDustBands(ctx, w, h, seed)

      // layout
      const minD     = Math.min(w, h)
      const SAFE_PAD = Math.max(14, minD * (w < 420 ? 0.055 : 0.07))

      // adaptive footer modes to preserve ring radius
      const targetRadiusA = minD * 0.34      // prefer
      const targetRadiusB = minD * 0.30      // acceptable
      const targetRadiusC = minD * 0.27      // minimal

      let mode = 'normal'
      let FOOTER_H = measureFooter(ctx, w, h, SAFE_PAD, colors, quote, quoteAuthor, logoImg, mode, logoScale).totalH
      let radiusBase = calcRadius(w, h, SAFE_PAD, FOOTER_H)

      if (radiusBase < targetRadiusA) {
        mode = 'compact'
        FOOTER_H = measureFooter(ctx, w, h, SAFE_PAD, colors, quote, quoteAuthor, logoImg, mode, logoScale).totalH
        radiusBase = calcRadius(w, h, SAFE_PAD, FOOTER_H)
      }
      if (radiusBase < targetRadiusB) {
        mode = 'ultra'
        FOOTER_H = measureFooter(ctx, w, h, SAFE_PAD, colors, quote, quoteAuthor, logoImg, mode, logoScale).totalH
        radiusBase = calcRadius(w, h, SAFE_PAD, FOOTER_H)
      }
      // hard clamp if still small
      if (radiusBase < targetRadiusC) {
        const minFooter = Math.max(72, minD * 0.12)
        FOOTER_H = Math.max(minFooter, FOOTER_H * 0.9)
        radiusBase = calcRadius(w, h, SAFE_PAD, FOOTER_H)
      }

      // ring area
      const cx = w / 2
      const cy = SAFE_PAD + ( (h - FOOTER_H) - SAFE_PAD * 2 ) / 2

      // radii normalize to HAPPY
      const happyRx = ringDefs?.HAPPY?.rx || (ringOrder.length ? ringDefs[ringOrder[0]].rx : 42)
      const rMap = {}
      for (const mood of ringOrder) {
        const rx = ringDefs[mood].rx || happyRx
        rMap[mood] = (rx / happyRx) * radiusBase
      }

      // colored rings
      const baseThickness = Math.max(1.3, w * 0.0021)
      for (const mood of ringOrder) {
        const col = colors[mood] || '#e5e7eb'
        const r = rMap[mood]
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.strokeStyle = hexA(col, 0.16)
        ctx.lineWidth = baseThickness * 2.2
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.strokeStyle = hexA(col, 0.85)
        ctx.lineWidth = baseThickness
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke()
        ctx.restore()
      }

      // streak lines
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      ctx.lineWidth = Math.max(1.2, w*0.0016)
      ctx.lineCap = 'round'
      ctx.beginPath()
      let started = false
      const pts = starsData.map(s => {
        const theta = Math.atan2((s.y - 50), (s.x - 50))
        const r = rMap[s.mood] ?? radiusBase * 0.5
        return [cx + Math.cos(theta)*r, cy + Math.sin(theta)*r]
      })
      for (const [px,py] of pts) {
        if (!started) { ctx.moveTo(px,py); started = true } else { ctx.lineTo(px,py) }
      }
      ctx.stroke()
      ctx.restore()

      // stars
      for (let i = 0; i < starsData.length; i++) {
        const s = starsData[i]
        const theta = Math.atan2((s.y - 50), (s.x - 50))
        const r = rMap[s.mood] ?? radiusBase * 0.5
        const px = cx + Math.cos(theta)*r
        const py = cy + Math.sin(theta)*r
        const color = colors[s.mood] || '#e5e7eb'
        const coreR = scaleCoreRadiusSmall(s.r, w, h)
        drawRealisticStar(ctx, px, py, coreR, color, s.glow || 0.8)
      }

      // footer (inside canvas)
      const footerTop = h - FOOTER_H
      drawFooter(ctx, w, h, SAFE_PAD, footerTop, FOOTER_H, colors, quote, quoteAuthor, logoImg, watermarkText, mode, logoScale)
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [ringDefs, ringOrder.join(','), starsData, colors, bgStars, seed, logoImg, watermarkText, quote, quoteAuthor])

  return (
    <div
      ref={wrapRef}
      className="relative aspect-[4/5] md:aspect-[10/7] w-full overflow-hidden rounded-2xl border border-white/10"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0">
      {/* colțul dreapta-jos; ajustează h-5/md:h-6 dacă vrei mai mare */}
      <div className="absolute right-2 bottom-2 md:right-3 md:bottom-3 flex items-center gap-2">
        {logoSrc ? (
          // imaginea nu consumă spațiu, e doar „lipită” peste canvas
          <img
            src={logoSrc}
            alt="logo"
            className="h-10 md:h-14 opacity-90"
            style={{ imageRendering: 'auto',mixBlendMode: 'lighten' }}
          />
        ) : (
          <span className="text-white/80 text-[10px] md:text-xs font-semibold">
            {watermarkText}
          </span>
        )}
      </div>
    </div>

    </div>
  )
}

/* ==================== Footer measurement & drawing ==================== */

function calcRadius(w, h, pad, footerH) {
  const innerW = w - pad * 2
  const innerH = (h - footerH) - pad * 2
  return Math.max(10, Math.min(innerW, innerH) / 2)
}

function measureFooter(ctx, w, h, pad, colors, quote, quoteAuthor, logoImg, mode, logoScale) {
  const minD = Math.min(w, h)

  // legend metrics (base)
  let fsLegend = clamp(minD * 0.020, 9, 12)
  let dotR     = clamp(minD * 0.007, 3, 5.5)
  let gap      = 18
  if (mode === 'compact') {
    fsLegend *= 0.92; dotR *= 0.92; gap = 16
  }
  if (mode === 'ultra') {
    fsLegend *= 0.85; dotR *= 0.85; gap = 14
  }

  const items = ['HAPPY','NEUTRAL','SAD','ANGRY','ANXIOUS']
  ctx.save()
  ctx.font = `${fsLegend}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`
  const blocks = items.map(m => {
    const label = capFirst(m.toLowerCase())
    const labelW = ctx.measureText(label).width
    return { mood: m, label, blockW: 2*dotR + 8 + labelW + gap, labelW }
  })
  const maxRowW = w - pad*2

  let rows = [[]]
  let curW = 0
  for (const b of blocks) {
    if (curW + b.blockW > maxRowW && rows.length < 2) {
      rows.push([b]); curW = b.blockW
    } else {
      rows[rows.length - 1].push(b); curW += b.blockW
    }
  }
  // in ultra, forțăm 1 rând (vom desena doar buline + inițiale mici)
  if (mode === 'ultra') {
    rows = [blocks]
  }
  ctx.restore()

  const lineHLegend = Math.max(18, fsLegend + dotR*2 + 4)
  const legendH = (mode === 'ultra')
    ? lineHLegend * 0.9
    : rows.length * lineHLegend

  // quote budget
  const baseFS1 = clamp(14, 9, 14)
  let quoteLines = 3
  if (mode === 'compact') quoteLines = 2
  if (mode === 'ultra') quoteLines = 1
  const quoteH = quoteLines * baseFS1 * 1.35 + (quoteAuthor ? (12 * 1.25 + 4) : 0)

  // watermark
  const totalH = legendH + 8 + quoteH + pad*0.15

  return { totalH, fsLegend, dotR, gap, items, rows, lineHLegend, mode }
}

function drawFooter(ctx, w, h, pad, footerTop, footerH, colors, quote, quoteAuthor, logoImg, watermarkText, mode, logoScale) {
  const minD = Math.min(w, h)

  // derive legend metrics similar to measureFooter
  let fsLegend = clamp(minD * 0.020, 9, 12)
  let dotR     = clamp(minD * 0.007, 3, 5.5)
  let gap      = 18
  if (mode === 'compact') { fsLegend *= 0.92; dotR *= 0.92; gap = 16 }
  if (mode === 'ultra')   { fsLegend *= 0.85; dotR *= 0.85; gap = 14 }

  const items = ['HAPPY','NEUTRAL','SAD','ANGRY','ANXIOUS']
  ctx.save()
  ctx.font = `${fsLegend}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`
  const blocks = items.map(m => {
    const label = capFirst(m.toLowerCase())
    const labelW = ctx.measureText(label).width
    return { mood: m, label, blockW: 2*dotR + 8 + labelW + gap, labelW }
  })
  const maxRowW = w - pad*2
  let rows = [[]]
  let curW = 0
  for (const b of blocks) {
    if (curW + b.blockW > maxRowW && rows.length < 2) {
      rows.push([b]); curW = b.blockW
    } else {
      rows[rows.length - 1].push(b); curW += b.blockW
    }
  }
  if (mode === 'ultra') rows = [blocks]

  const lineHLegend = Math.max(18, fsLegend + dotR*2 + 4)
  let yLegend = footerTop + 6 + dotR

  // draw legend centered
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = 2.5
  ctx.shadowOffsetY = 0.4

  if (mode === 'ultra') {
    // un singur rând de buline + inițiale mici sub fiecare
    const miniFS = Math.max(8, fsLegend * 0.78)
    const blockWdot = dotR*2 + 10 + Math.max(16, miniFS * 1.2)
    const totalW = blockWdot * items.length - 10
    let x = (w - totalW) / 2
    ctx.textAlign = 'center'
    for (const m of items) {
      ctx.fillStyle = colors[m] || '#e5e7eb'
      ctx.beginPath(); ctx.arc(x + dotR, yLegend, dotR, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = 'rgba(229,231,235,0.85)'
      ctx.font = `${miniFS}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`
      ctx.fillText(shortLabel(m), x + dotR, yLegend + dotR + 10)
      x += blockWdot
    }
    yLegend += lineHLegend // avansează pentru quote
  } else {
    for (const row of rows) {
      const rowW = row.reduce((s, b) => s + b.blockW, 0) - gap
      let x = (w - rowW) / 2
      for (const b of row) {
        ctx.fillStyle = colors[b.mood] || '#e5e7eb'
        const xDot = x + dotR
        ctx.beginPath(); ctx.arc(xDot, yLegend, dotR, 0, Math.PI*2); ctx.fill()

        ctx.fillStyle = 'rgba(229,231,235,0.90)'
        ctx.textAlign = 'left'
        ctx.fillText(b.label, xDot + dotR + 8, yLegend)
        x += b.blockW
      }
      yLegend += lineHLegend
    }
  }
  ctx.restore()

  // quote centered
  const left = pad, right = w - pad
  const maxWidth = right - left
  const scale = clamp(maxWidth / 520, mode === 'ultra' ? 0.62 : 0.70, 1)
  const fs1 = clamp(14 * scale, 8, 14)
  const fs2 = clamp(12 * scale, 7, 12)
  const lh1 = fs1 * 1.35
  const lh2 = fs2 * 1.25

  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = 2.5
  ctx.shadowOffsetY = 0.4
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = `italic ${fs1}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`

  const quoteYTop = yLegend + 4
  const centerX = w / 2
  const wrapped = wrapTextCanvas(ctx, `“${quote}”`, maxWidth)
  const maxLines = mode === 'ultra' ? 1 : (maxWidth < 360 ? 2 : 3)
  let lines = wrapped.slice(0, maxLines)
  if (wrapped.length > maxLines) {
    let last = lines[lines.length - 1]
    while (ctx.measureText(last + '…').width > maxWidth && last.length > 0) last = last.slice(0, -1)
    lines[lines.length - 1] = last + '…'
  }

  let y = quoteYTop
  for (const l of lines) { ctx.fillText(l, centerX, y); y += lh1 }

  if (quoteAuthor) {
    ctx.fillStyle = 'rgba(229,231,235,0.88)'
    ctx.font = `${fs2}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`
    ctx.fillText(quoteAuthor, centerX, y + 2)
    y += lh2
  }
  ctx.restore()
}

/* ==================== Stars & background ==================== */

function drawStarLayer(ctx, arr, w, h, baseOpacity) {
  ctx.save()
  ctx.fillStyle = '#fff'
  const minD = Math.min(w,h)
  const mobileScale = minD < 420 ? clamp(minD / 420, 0.85, 1) : 1
  for (const s of arr) {
    ctx.globalAlpha = Math.min(1, baseOpacity * s.o)
    const rEff = s.r * (minD/100) * 1.08 * mobileScale
    ctx.beginPath()
    ctx.arc((s.x/100)*w, (s.y/100)*h, rEff, 0, Math.PI*2)
    ctx.fill()
  }
  ctx.restore()
}

function drawDustBands(ctx, w, h, seed) {
  const rand = seeded(seed + 1337)
  const bands = 3
  for (let i = 0; i < bands; i++) {
    const cx = w * (0.2 + 0.6 * rand())
    const cy = h * (0.2 + 0.6 * rand())
    const rx = w * (0.25 + 0.25 * rand())
    const ry = h * (0.10 + 0.15 * rand())
    const rot = (rand() * Math.PI) - (Math.PI/2)

    ctx.save()
    ctx.translate(cx, cy); ctx.rotate(rot)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry))
    g.addColorStop(0,   'rgba(255,255,255,0.015)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.008)')
    g.addColorStop(1,   'rgba(255,255,255,0.000)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI*2); ctx.fill()
    ctx.restore()
  }
}

function drawRealisticStar(ctx, x, y, rCore, color, glow) {
  const haloR = rCore * (2.6 + glow * 0.7)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const g = ctx.createRadialGradient(x, y, 0, x, y, haloR)
  g.addColorStop(0.0, hexA(color, 0.20 + glow * 0.07))
  g.addColorStop(0.6, hexA(color, 0.09 + glow * 0.05))
  g.addColorStop(1.0, 'rgba(255,255,255,0.00)')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, haloR, 0, Math.PI*2); ctx.fill()
  ctx.restore()

  // specks
  ctx.save()
  ctx.fillStyle = hexA(color, 0.06)
  const specks = 10
  for (let i = 0; i < specks; i++) {
    const a = (i / specks) * Math.PI*2 + i * 0.41
    const rr = haloR * (0.72 + (i % 3) * 0.09)
    const sx = x + Math.cos(a) * rr
    const sy = y + Math.sin(a) * rr
    const sr = Math.max(0.25, rCore * 0.22)
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI*2); ctx.fill()
  }
  ctx.restore()

  // core
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(x, y, rCore, 0, Math.PI*2); ctx.fill()
  ctx.restore()
}

function scaleCoreRadiusSmall(rNorm, w, h) {
  const base = (Math.min(w,h) / 100) * (0.60 + rNorm * 0.65)
  return Math.max(1.3, Math.min(3.4, base))
}

/* ==================== utils ==================== */

function hexA(hex, a) {
  const c = hex.replace('#','')
  const i = parseInt(c, 16)
  const r = (i >> 16) & 255, g = (i >> 8) & 255, b = i & 255
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)) }
function capFirst(s) { return s.charAt(0).toUpperCase() + s.slice(1) }
function shortLabel(m) { return {HAPPY:'Ha', NEUTRAL:'Ne', SAD:'Sa', ANGRY:'An', ANXIOUS:'Ax'}[m] || m.slice(0,2) }

function wrapTextCanvas(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/)
  const lines = []
  let line = ''
  for (let n = 0; n < words.length; n++) {
    const test = line ? `${line} ${words[n]}` : words[n]
    if (ctx.measureText(test).width <= maxWidth) line = test
    else { if (line) lines.push(line); line = words[n] }
  }
  if (line) lines.push(line)
  return lines
}

function seeded(seed) {
  let t = (seed || 1) >>> 0
  return () => {
    t += 0x9E3779B9
    let r = Math.imul(t ^ (t >>> 16), 0x85ebca6b)
    r ^= r >>> 13
    r = Math.imul(r, 0xc2b2ae35)
    r ^= r >>> 16
    return ((r >>> 0) / 4294967296)
  }
}

function makeDeepStarfield(seed) {
  const rand = seeded(seed)
  const mk = (n, rMin, rMax, oMin, oMax) =>
    Array.from({ length: n }, () => ({
      x: Math.round(rand() * 1000) / 10,
      y: Math.round(rand() * 1000) / 10,
      r: Math.round((rand() * (rMax - rMin) + rMin) * 100) / 100,
      o: Math.round((rand() * (oMax - oMin) + oMin) * 100) / 100,
    }))
  return {
    far:  mk(220, 0.04, 0.09, 0.05, 0.18),
    mid:  mk(160, 0.07, 0.15, 0.10, 0.28),
    near: mk(110, 0.10, 0.22, 0.18, 0.40),
  }
}

function defaultQuoteFor(mood) {
  const map = {
    HAPPY:   { text: 'Notice the small joys; they add up to constellations.' },
    NEUTRAL: { text: 'Balance is the quiet rhythm that keeps the stars aligned.' },
    SAD:     { text: 'Even on dim nights, your sky still holds light.' },
    ANGRY:   { text: 'Let the heat draw lines, not walls—then breathe.' },
    ANXIOUS: { text: 'When thoughts scatter, gently name them. They soften.' },
  }
  return map[mood] || map.NEUTRAL
}
