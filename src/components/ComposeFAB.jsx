// components/ComposeFAB.jsx
'use client'

import { useEffect, useState } from 'react'
import PostForm from './PostForm'

export default function ComposeFAB({ onPosted, setError }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false) }
    if (open) document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [open])

  return (
    <>
      {/* Floating Action Button — visible only on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 rounded-full bg-primary px-5 py-3 text-sm text-inverted shadow-lg transition hover:opacity-90 sm:hidden"
        aria-label="Compose new post"
      >
        New
      </button>

      {/* Bottom sheet */}
      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 sm:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-secondary bg-card p-4">
            <div className="mx-auto max-w-2xl">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold text-inverted">Compose</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-secondary px-2 py-0.5 text-xs text-inverted hover:bg-surface transition"
                >
                  Close
                </button>
              </div>

              <PostForm
                onPost={() => { onPosted?.(); setOpen(false) }}
                setError={setError}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
