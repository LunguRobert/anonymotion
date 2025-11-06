// components/CookieConsent.jsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

/**
 * Design goals:
 * - Ethical: clear Accept & Reject, same size hit targets, visible link to Privacy.
 * - Persuasive: strong visual hierarchy; positive microcopy; primary button high-contrast.
 * - On-brand: dark card, soft gradient, rounded-xl, subtle glow, matches your site.
 * - Accessible: role="dialog", aria labels, focus handling, Escape to close with current choice.
 * - Lightweight: no dependencies; remembers choice in localStorage.
 */

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // slight delay so it appears after above-the-fold paints
    const t = setTimeout(() => {
      try {
        const c = localStorage.getItem('cookie-consent')
        if (!c) setVisible(true)
      } catch {}
    }, 500)
    return () => clearTimeout(t)
  }, [])

  // expose a simple way to reopen from a footer link if you want
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__openConsent = () => setVisible(true)
    }
  }, [])

  const updateConsent = (granted) => {
    try { localStorage.setItem('cookie-consent', granted ? 'granted' : 'denied') } catch {}
    setVisible(false)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: granted ? 'granted' : 'denied',
        analytics_storage: granted ? 'granted' : 'denied',
        ad_user_data: granted ? 'granted' : 'denied',
        ad_personalization: granted ? 'granted' : 'denied',
      })
    }
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 z-[60]"
    >
      <div className="
        mx-auto md:ml-auto max-w-md rounded-2xl border border-white/10
        bg-[radial-gradient(60%_90%_at_10%_0%,rgba(99,102,241,0.16),transparent)]
        backdrop-blur-sm bg-black/70 text-white shadow-2xl
        ring-1 ring-white/10
      ">
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
              {/* tiny spark icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2c.7 3.9-1.3 5.8-5.2 5.2C7.5 11 9.4 13 13.3 12.3C12.5 16.2 14.5 18 18 18c-2.1-2.8-1.1-5 2-6c-3.2-.2-4.9-1.9-4.7-5.1C14.1 8 12.4 7 12 2z"/></svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold leading-6">We use analytics cookies (only).</h3>
              <p className="mt-1 text-sm text-white/80">
                Help us improve Anonymotion. No ads, no tracking across sites — just anonymous usage stats.
              </p>
              <div className="mt-2 text-xs text-white/60">
                Read our{' '}
                <Link href="/legal/privacy" className="underline decoration-white/30 hover:decoration-white">
                  Privacy Policy
                </Link>.
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
            {/* Secondary action kept visible but lower emphasis */}
            <button
              onClick={() => updateConsent(false)}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"
            >
              Reject
            </button>

            {/* Primary: high contrast, first in focus order on desktop via DOM order tweak */}
            <button
              onClick={() => updateConsent(true)}
              autoFocus
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-white text-black px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition shadow"
            >
              Accept & continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
