'use client'

import { useCallback, useState } from 'react'
import jsPDF from 'jspdf'
import { Download, FileText, Info } from 'lucide-react'

/**
 * Buttons to export the current constellation as PNG and as a premium-styled PDF.
 *
 * Props:
 *  - targetSelector: CSS selector for the <canvas> inside MindConstellation
 *  - apiParams?: override URLSearchParams for fetching constellation data (defaults: last month)
 *  - logoSrc?: optional watermark logo (webp/svg/png) to embed (same-origin recommended)
 *  - appName?: fallback watermark text if no logo
 */
export default function ConstellationActions({
  targetSelector = '#constellation-root canvas',
  apiParams,
  logoSrc,
  appName = 'Mind Constellation',
}) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  /* ----------------------- PNG EXPORT (with watermark) ----------------------- */
const handleDownloadPNG = useCallback(async () => {
  try {
    setBusy(true); setMsg('')
    const canvas = document.querySelector(targetSelector)
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      setMsg('Canvas not found. Scroll to the visualization and try again.')
      return
    }

    // compunem într-un canvas offscreen la rezoluția reală (device pixels)
    const w = canvas.width
    const h = canvas.height
    const off = document.createElement('canvas')
    off.width = w
    off.height = h
    const ctx = off.getContext('2d')

    // 1) conținutul constelației
    ctx.drawImage(canvas, 0, 0)

    // 2) watermark (logo sau text), fără să „taint-uim” canvas-ul
    const PAD = Math.round(Math.min(w, h) * 0.02) // 2% margine
    if (logoSrc) {
      try {
        const logoEl = await loadImageElement(logoSrc) // same-origin recomandat
        const ratio = logoEl.naturalWidth / logoEl.naturalHeight
        const targetH = Math.round(Math.min(w, h) * 0.06) // ~6% din dimensiunea minimă
        const targetW = Math.round(targetH * ratio)
        ctx.globalAlpha = 0.95
        ctx.drawImage(logoEl, w - PAD - targetW, h - PAD - targetH, targetW, targetH)
        ctx.globalAlpha = 1
      } catch {
        // fallback la text dacă nu reușește logo
        const fs = Math.round(Math.min(w, h) * 0.035)
        ctx.font = `600 ${fs}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`
        ctx.fillStyle = 'rgba(255,255,255,0.92)'
        const text = appName || 'Mind Constellation'
        const tw = ctx.measureText(text).width
        ctx.fillText(text, w - PAD - tw, h - PAD - Math.round(fs * 0.15))
      }
    } else {
      const fs = Math.round(Math.min(w, h) * 0.035)
      ctx.font = `600 ${fs}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`
      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      const text = appName || 'Mind Constellation'
      const tw = ctx.measureText(text).width
      ctx.fillText(text, w - PAD - tw, h - PAD - Math.round(fs * 0.15))
    }

    // 3) descarcă PNG
    const now = new Date()
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const dataUrl = off.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `mind-constellation-${key}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setMsg('PNG downloaded ✓')
  } catch (e) {
    console.error(e)
    setMsg('Failed to download PNG.')
  } finally {
    setBusy(false); setTimeout(() => setMsg(''), 2500)
  }
}, [targetSelector, logoSrc, appName])


  /* ----------------------- PDF EXPORT (premium layout) ----------------------- */
const handleDownloadPDF = useCallback(async () => {
  try {
    setBusy(true); setMsg('')

    // 1) Canvas snapshot (fără overlay HTML)
    const canvas = document.querySelector(targetSelector)
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      setMsg('Canvas not found. Scroll to the visualization and try again.')
      return
    }
    const pngDataUrl = canvas.toDataURL('image/png')

    // 2) Analytics (titlu, legendă, metrici, citat)
    const now = new Date()
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const qs = new URLSearchParams({
      layout: 'rings',
      mode: 'month',
      month: defaultMonth,
      ...(apiParams || {}),
    })
    const res = await fetch(`/api/gamify/constellation?${qs.toString()}`, { cache: 'no-store' })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error || 'Failed to load constellation data')

    const monthKey = json?.key || defaultMonth
    const colors = json?.colors || {
      HAPPY:'#facc15', NEUTRAL:'#a3a3a3', SAD:'#60a5fa', ANGRY:'#f87171', ANXIOUS:'#c084fc'
    }
    const counts = json?.meta?.counts || {}
    const score  = Math.round(json?.meta?.score ?? 0)
    const predominant = json?.meta?.predominantMood || 'NEUTRAL'
    const quote = json?.meta?.quote?.text || defaultQuotes[predominant] || defaultQuotes.NEUTRAL
    const quoteAuthor = json?.meta?.quote?.author || ''
    const entriesCount = (json?.stars || []).length

    // 3) Creează PDF-ul acum (abia acum putem folosi `doc`)
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 42

    // Header band + body bg
    const headerH = 152; // ← era 128. Poți pune 160–184 după gust.
    doc.setFillColor(11,16,32);  doc.rect(0, 0,     pageW, headerH, 'F')
    doc.setFillColor(14,20,40);  doc.rect(0, headerH, pageW, pageH - headerH, 'F')


    // Header title & subtitle (stânga)
    const title = `Mind Constellation — ${monthKey}`
    const subtitle = 'Stars from your entries. Rings by mood. Lines connect streak days.'
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(22)
    doc.text(title, margin, 64)
    doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.setTextColor(220,226,234)
    doc.text(subtitle, margin, 86)

    // Header: logo în dreapta (păstrăm raportul de aspect)
    if (logoSrc) {
      try {
        const logo = await loadImageDataUrl(logoSrc) // { dataUrl, width, height }
        const ratio = logo.width / logo.height
        const baseH = 22
        const targetH = Math.min(64, Math.max(18, baseH * 2.6)) // ⇦ mărește/micșorează multiplicatorul
        const targetW = targetH * ratio
        const logoY  = 42 // puțin mai sus ca să nu se lipească de subtitlu
        doc.addImage(logo.dataUrl, 'PNG', pageW - margin - targetW, logoY, targetW, targetH, undefined, 'FAST')

      } catch {
        // fallback text watermark
        doc.setTextColor(230, 230, 235)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        const wm = appName || 'Mind Constellation'
        const tw = doc.getTextWidth(wm)
        doc.text(wm, pageW - margin - tw, 64)
      }
    } else {
      doc.setTextColor(230, 230, 235)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      const wm = appName || 'Mind Constellation'
      const tw = doc.getTextWidth(wm)
      doc.text(wm, pageW - margin - tw, 64)
    }

    // Paragraf informativ
    const info = [
      'Your constellation is a generative snapshot of the last 30 days. ',
      'Each star is an entry; mood rings color the sky; the line traces your streak continuity. ',
      'Save it monthly to notice patterns and celebrate progress.',
    ].join('')
    doc.setTextColor(232,236,245); doc.setFont('helvetica','normal'); doc.setFontSize(11)
    drawParagraph(doc, info, margin, 118, pageW - margin*2, 16)

    // Card imagine (canvas)
    const boxX = margin, boxY = 170, boxW = pageW - margin*2, boxH = 360
    if (doc.roundedRect) { doc.setFillColor(18,24,46); doc.roundedRect(boxX, boxY, boxW, boxH, 12, 12, 'F') }
    else { doc.setFillColor(18,24,46); doc.rect(boxX, boxY, boxW, boxH, 'F') }

    // încadrăm imaginea păstrând aspectul
    const canvasAspect = canvas.width / canvas.height
    let imgW = boxW - 24
    let imgH = imgW / canvasAspect
    if (imgH > boxH - 24) { imgH = boxH - 24; imgW = imgH * canvasAspect }
    const imgX = boxX + (boxW - imgW)/2
    const imgY = boxY + (boxH - imgH)/2
    doc.addImage(pngDataUrl, 'PNG', imgX, imgY, imgW, imgH, undefined, 'FAST')

    // Două carduri: KPI & Legendă
    const colGap = 20, colW = (pageW - margin*2 - colGap) / 2, statY = boxY + boxH + 28

    // KPI
    if (doc.roundedRect) { doc.setFillColor(18,24,46); doc.roundedRect(margin, statY, colW, 140, 10, 10, 'F') }
    else { doc.setFillColor(18,24,46); doc.rect(margin, statY, colW, 140, 'F') }
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(12)
    doc.text('Your month at a glance', margin + 14, statY + 22)
    doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.setTextColor(220,226,234)
    const metrics = [
      ['Brightness score', String(score)],
      ['Predominant mood', human(predominant)],
      ['Entries (total)', String(entriesCount)],
    ]
    let mY = statY + 48
    metrics.forEach(([k,v]) => {
      doc.text(k, margin + 14, mY)
      doc.setFont('helvetica','bold'); doc.text(v, margin + 14 + 180, mY)
      doc.setFont('helvetica','normal'); mY += 18
    })

    // Legendă
    const rightX = margin + colW + colGap
    if (doc.roundedRect) { doc.setFillColor(18,24,46); doc.roundedRect(rightX, statY, colW, 140, 10, 10, 'F') }
    else { doc.setFillColor(18,24,46); doc.rect(rightX, statY, colW, 140, 'F') }
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(12)
    doc.text('Mood legend & counts', rightX + 14, statY + 22)
    const items = ['HAPPY','NEUTRAL','SAD','ANGRY','ANXIOUS']
    let ly = statY + 50
    doc.setFont('helvetica','normal'); doc.setFontSize(11); doc.setTextColor(220,226,234)
    items.forEach((mood) => {
      const rgb = hexToRgb(colors[mood] || '#ffffff')
      doc.setFillColor(rgb.r, rgb.g, rgb.b)
      doc.circle(rightX + 16, ly - 4, 4, 'F')
      doc.text(`${human(mood)} — ${counts[mood] ?? 0}`, rightX + 30, ly)
      ly += 18
    })

    // Citat
    const quoteTop = statY + 160
    if (doc.roundedRect) { doc.setFillColor(18,24,46); doc.roundedRect(margin, quoteTop, pageW - margin*2, 90, 10, 10, 'F') }
    else { doc.setFillColor(18,24,46); doc.rect(margin, quoteTop, pageW - margin*2, 90, 'F') }
    doc.setTextColor(240,240,245); doc.setFont('helvetica','italic'); doc.setFontSize(12)
    drawParagraph(doc, `“${quote}”`, margin + 14, quoteTop + 24, pageW - (margin + 14)*2, 16)
    if (quoteAuthor) {
      doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(215,220,230)
      doc.text(quoteAuthor, margin + 14, quoteTop + 72)
    }

    // Footer fin
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(180,190,205)
    const genOn = new Date().toLocaleString()
    doc.text(`Generated on ${genOn}`, margin, pageH - 22)
    const credit = appName || 'Mind Constellation'
    const cw = doc.getTextWidth(credit)
    doc.text(credit, pageW - margin - cw, pageH - 22)

    doc.save(`mind-constellation-${monthKey}.pdf`)
    setMsg('PDF downloaded ✓')
  } catch (e) {
    console.error(e)
    setMsg('Failed to generate PDF.')
  } finally {
    setBusy(false); setTimeout(() => setMsg(''), 2500)
  }
}, [targetSelector, apiParams, logoSrc, appName])


  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {/* PNG */}
      <button
        onClick={handleDownloadPNG}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition disabled:opacity-60"
        title="Download PNG"
      >
        <Download className="h-4 w-4" />
        {busy ? 'Preparing…' : 'Download PNG'}
      </button>

      {/* PDF */}
      <button
        onClick={handleDownloadPDF}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition disabled:opacity-60"
        title="Download PDF"
      >
        <FileText className="h-4 w-4" />
        {busy ? 'Preparing…' : 'Download PDF'}
      </button>

      {/* Tip */}
      <div
        className="
          flex w-full items-start gap-2
          rounded-lg border border-white/12 bg-white/5
          px-2.5 py-2
          text-[11px] leading-snug text-white/80
          sm:w-auto sm:items-center sm:rounded-full sm:px-3 sm:py-1.5 sm:text-xs
        "
        title="Tip"
        role="note"
      >
        <Info className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
        <span className="whitespace-normal">
          For crisper export, open the page wider before downloading.
        </span>
      </div>

      {msg ? <span className="text-xs text-white/70">{msg}</span> : null}
    </div>
  )
}

/* ----------------- helpers ----------------- */

const defaultQuotes = {
  HAPPY:   'Notice the small joys; they add up to constellations.',
  NEUTRAL: 'Balance is the quiet rhythm that keeps the stars aligned.',
  SAD:     'Even on dim nights, your sky still holds light.',
  ANGRY:   'Let the heat draw lines, not walls—then breathe.',
  ANXIOUS: 'When thoughts scatter, gently name them. They soften.',
}

// Încarcă imaginea ca element <img> (pentru PNG export pe offscreen)
function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const el = new Image()
    el.crossOrigin = 'anonymous'
    el.onload = () => resolve(el)
    el.onerror = reject
    el.src = src
  })
}

// Încarcă și returnează dataURL + dimensiuni (pentru PDF ratio corect)
async function loadImageDataUrl(src) {
  const img = await loadImageElement(src)
  const c = document.createElement('canvas')
  c.width = img.naturalWidth
  c.height = img.naturalHeight
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0)
  return { dataUrl: c.toDataURL('image/png'), width: img.naturalWidth, height: img.naturalHeight }
}


function capFirst(s) { return (s||'').charAt(0).toUpperCase() + String(s||'').slice(1) }
function human(v) {
  const map = { HAPPY:'Happy', NEUTRAL:'Neutral', SAD:'Sad', ANGRY:'Angry', ANXIOUS:'Anxious', NONE:'None' }
  const key = String(v||'').toUpperCase()
  return map[key] ?? capFirst(String(v||'').toLowerCase())
}
function hexToRgb(hex) {
  const c = hex.replace('#',''); const n = parseInt(c,16)
  return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 }
}

/** Create a square PNG from a logo (keeps aspect), optionally recolored to pure white with given alpha. */
async function prepareLogoSquareDataUrl(src, size = 256, toWhite = true, alpha = 0.9) {
  const img = await loadImg(src)
  const c = document.createElement('canvas'); c.width = size; c.height = size
  const ctx = c.getContext('2d')
  // fit contain
  const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight)
  const w = Math.round(img.naturalWidth * scale)
  const h = Math.round(img.naturalHeight * scale)
  const x = Math.round((size - w) / 2)
  const y = Math.round((size - h) / 2)
  ctx.drawImage(img, x, y, w, h)

  if (toWhite) {
    // Recolor la alb păstrând alfa existent (funcționează cel mai bine cu logo transparent)
    ctx.globalCompositeOperation = 'source-in'
    ctx.fillStyle = `rgba(255,255,255,${alpha})`
    ctx.fillRect(0, 0, size, size)
    ctx.globalCompositeOperation = 'source-over'
  }
  return c.toDataURL('image/png')
}

/** Compose an offscreen PNG that includes the current canvas + bottom-right watermark (logo or text). */
async function composePngWithWatermark(canvas, { logoSrc, watermarkText }) {
  const w = canvas.width
  const h = canvas.height
  const out = document.createElement('canvas'); out.width = w; out.height = h
  const ctx = out.getContext('2d')
  // draw original
  ctx.drawImage(canvas, 0, 0)

  const minD = Math.min(w, h)
  const pad = Math.round(minD * 0.02)
  const targetH = Math.max(Math.round(minD * 0.06), 28) // mărime vizibilă

  if (logoSrc) {
    // păstrăm logo-ul original (cu fundal negru), dar îl desenăm cu blend 'lighten'
    const img = await loadImg(logoSrc)
    // îl încadrăm 1:1 într-un pătrat pentru siguranță (opțional, dar arată mai consistent)
    const square = await makeSquareCanvas(img, 256) // fără recolor
    const ratio = 1 // square
    const drawW = targetH * ratio
    const drawH = targetH

    ctx.save()
    ctx.globalCompositeOperation = 'lighten' // 👈 magic: negrul nu influențează, rămân doar părțile luminoase ale logo-ului
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(square, w - pad - drawW, h - pad - drawH, drawW, drawH)
    ctx.restore()
  } else {
    drawWatermarkText(ctx, watermarkText, w, h, pad)
  }

  return out.toDataURL('image/png')
}


function drawWatermarkText(ctx, text, w, h, pad) {
  if (!text) return
  const fs = Math.max(12, Math.round(Math.min(w,h) * 0.03))
  ctx.font = `600 ${fs}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  const tw = ctx.measureText(text).width
  ctx.fillText(text, w - pad - tw, h - pad - 4)
}

function loadImg(src) {
  return new Promise((resolve, reject) => {
    const el = new Image()
    el.crossOrigin = 'anonymous'
    el.onload = () => resolve(el)
    el.onerror = reject
    el.src = src
  })
}

/** Wrap paragraph on a single column in jsPDF. */
function drawParagraph(doc, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(/\s+/)
  let line = ''
  let yy = y
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w
    if (doc.getTextWidth(test) <= maxWidth) {
      line = test
    } else {
      if (line) doc.text(line, x, yy)
      line = w
      yy += lineHeight
    }
  })
  if (line) doc.text(line, x, yy)
}
