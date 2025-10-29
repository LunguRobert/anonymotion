'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import JournalEntryCard from './JournalEntryCard'

export default function JournalTimeline({ entries, onEditEntry }) {
  const [activeDotTop, setActiveDotTop] = useState(0)
  const [activeEntryId, setActiveEntryId] = useState(null)

  return (
    <div className="timeline-container relative mx-auto max-w-[760px] px-2 py-8 sm:px-4 sm:py-10">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 z-0 w-1 rounded-full bg-gradient-to-b from-[var(--color-primary)]/50 via-[var(--color-secondary)]/40 to-[var(--color-primary)]/50" />

      {/* Moving dot */}
      <motion.div
        layout
        animate={{ top: activeDotTop }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        className="absolute z-20 h-4 w-4 rounded-full bg-primary ring-2 ring-[var(--color-card)] shadow"
        style={{ left: '18px' }}
      />

      <div className="flex flex-col gap-14 sm:gap-16">
        {entries.map((entry, index) => (
          <TimelineItem
            key={entry.id}
            entry={entry}
            index={index}
            onEdit={() => onEditEntry(entry)}
            setActiveDotTop={setActiveDotTop}
            setActiveEntryId={setActiveEntryId}
            activeEntryId={activeEntryId}
          />
        ))}
      </div>
    </div>
  )
}

function TimelineItem({ entry, index, onEdit, setActiveDotTop, setActiveEntryId, activeEntryId }) {
  const ref = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const cardMiddle = rect.top + rect.height / 2
      const viewportMiddle = window.innerHeight / 2
      const distance = Math.abs(viewportMiddle - cardMiddle)

      if (distance < 120) {
        const scrollTop = window.scrollY || window.pageYOffset
        const absoluteTop = rect.top + scrollTop + 8
        const parent = ref.current.closest('.timeline-container')
        const parentRect = parent.getBoundingClientRect()
        const parentTop = parentRect.top + scrollTop
        setActiveDotTop(absoluteTop - parentTop)
        setActiveEntryId(entry.id)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [entry.id, setActiveDotTop, setActiveEntryId])

  return (
    <div ref={ref} className="relative flex items-start">
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: index * 0.06 }}
        className="ml-16 w-full flex justify-center"
      >
        <JournalEntryCard
          entry={entry}
          onEdit={onEdit}
          isActive={entry.id === activeEntryId}
          index={index}
        />
      </motion.div>
    </div>
  )
}
