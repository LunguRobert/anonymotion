'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { getMoodStyles } from '@/utils/mood-utils'
import Image from 'next/image'

export default function JournalEntryCard({ entry, onEdit, isActive = false }) {
  const [expanded, setExpanded] = useState(false)
  const mood = entry.mood || 'NEUTRAL'
  const moodStyles = getMoodStyles(mood) || {}

  return (
    <motion.article
      onClick={() => setExpanded((v) => !v)}
      className={[
        'relative select-none rounded-2xl cursor-pointer',
        'w-full sm:w-[540px] md:w-[600px] lg:w-[680px] mx-auto',
        'min-h-[260px] md:min-h-[280px]',
        'flex flex-col',
        'border border-secondary bg-card shadow transition-all',
        isActive ? 'ring-2 ring-primary/40' : 'hover:scale-[1.01]',
        'px-5 py-6 text-inverted'
      ].join(' ')}
    >
      {/* Date */}
      <div className={`mb-3 text-center text-sm ${isActive ? 'text-primary' : 'text-muted'}`}>
        {format(new Date(entry.createdAt), 'MMMM d, yyyy')}
      </div>

      {/* Mood seal */}
      {moodStyles.seal && (
        <Image
          src={moodStyles.seal}
          alt="Mood seal"
          width={56}
          height={56}
          className="pointer-events-none absolute -top-3 -left-3 drop-shadow"
        />
      )}

      {/* Content */}
      <p
        className={[
          'mx-auto max-w-[60ch] whitespace-pre-line text-[15px] leading-relaxed flex-1 transition-all',
          expanded ? '' : 'line-clamp-6'
        ].join(' ')}
      >
        {entry.content}
      </p>

      {!expanded && entry.content.length > 250 && (
        <p className="mt-2 text-xs text-muted italic">… click to expand</p>
      )}

      {/* Bottom meta */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="rounded-full border border-secondary px-2 py-0.5 text-xs text-inverted">
          #{mood}
        </span>
      </div>

      {/* Edit button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onEdit?.()
        }}
        className="absolute top-3 right-3 rounded-full bg-card border border-secondary px-2 py-0.5 text-xs text-muted hover:text-primary"
        aria-label="Edit entry"
      >
        ✏️
      </button>
    </motion.article>
  )
}
