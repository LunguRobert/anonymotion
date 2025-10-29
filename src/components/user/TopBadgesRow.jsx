'use client'
import { useEffect, useState } from 'react'
import BadgeChip from '@/components/badges/BadgeChip'

export default function TopBadgesRow() {
  const [top, setTop] = useState(null)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/user/badges')
      if (!res.ok) { setTop([]); return }
      const data = await res.json()
      setTop(data.top3 || [])
    }
    load()
  }, [])

  if (top === null) {
    return <div className="flex gap-2 mt-1 text-sm text-gray-400">Loading...</div>
  }

  if (!top.length) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <span>🎖️</span>
        <span className="text-gray-500">🔒</span>
        <span className="text-gray-500">🔒</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {top.map(b => (
        <BadgeChip key={b.code} emoji={b.emoji} label={b.label} color={b.color} />
      ))}
    </div>
  )
}