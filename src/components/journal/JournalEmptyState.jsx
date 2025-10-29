'use client'

import Lottie from 'lottie-react'
import calmingLottie from '../../../public/lottie/meditation.json'

export default function JournalEmptyState({ onClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-40 w-40 opacity-80">
        <Lottie animationData={calmingLottie} loop autoplay />
      </div>

      <h2 className="mt-4 text-inverted text-lg font-semibold">No entries yet…</h2>
      <p className="mt-2 max-w-md text-sm text-muted">
        Begin your emotional journey today. Reflecting regularly helps you gain clarity, calm, and confidence.
      </p>

      <button
        onClick={onClick}
        className="mt-5 rounded-full bg-primary px-5 py-2 text-sm text-inverted shadow transition hover:opacity-90"
      >
        ✍️ Write your first entry
      </button>
    </div>
  )
}
