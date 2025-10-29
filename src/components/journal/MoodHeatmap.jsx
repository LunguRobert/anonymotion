'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isAfter,
} from 'date-fns'
import { getMoodStyles } from '@/utils/mood-utils'

export default function MoodHeatmap() {
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()))
  const [moodsByDate, setMoodsByDate] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const year = monthDate.getFullYear()
  const month1to12 = monthDate.getMonth() + 1

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(
          `/api/journal/heatmap?year=${year}&month=${month1to12}`,
          { cache: 'no-store', signal: controller.signal }
        )
        if (!res.ok) throw new Error('Failed to load heatmap')
        const { data } = await res.json()

        const normalized = {}
        for (const k in data) normalized[String(k)] = data[k]
        setMoodsByDate(normalized)
      } catch (e) {
        if (e.name !== 'AbortError') setError('Could not load heatmap.')
        setMoodsByDate({})
      } finally {
        setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [year, month1to12])

  const daysForGrid = useMemo(() => {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [monthDate])

  const weekdayLabels = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa', 'Du']
  const today = new Date()

  // blocăm viitorul: nu poți merge după luna curentă
  const isCurrentMonth = isSameMonth(monthDate, today)

  return (
    <div className="mb-8 px-4">
      {/* Header + navigație lună */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMonthDate(prev => subMonths(prev, 1))}
          className="px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition"
          aria-label="Previous month"
        >
          ‹
        </button>

        <h2 className="text-lg font-semibold text-center">
          Mood Map — {format(monthDate, 'MMMM yyyy')}
        </h2>

        <button
          onClick={() => !isCurrentMonth && setMonthDate(prev => addMonths(prev, 1))}
          disabled={isCurrentMonth}
          className={`px-2 py-1 rounded-md border border-white/10 transition ${
            isCurrentMonth
              ? 'opacity-30 cursor-not-allowed'
              : 'bg-white/5 hover:bg-white/10'
          }`}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Legendă */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/80 mb-3">
        {['HAPPY', 'SAD', 'ANGRY', 'ANXIOUS', 'NEUTRAL', 'NONE'].map((m) => {
          const i = getMoodStyles(m)
          return (
            <span key={m} className="inline-flex items-center gap-1">
              <Image src={i.seal} alt={`${m} icon`} width={14} height={14} />
              <span>{m}</span>
            </span>
          )
        })}
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-2 max-w-3xl mx-auto text-center mb-1">
        {weekdayLabels.map((d) => (
          <div key={d} className="text-[11px] text-white/60">{d}</div>
        ))}
      </div>

      {/* Grid zile */}
      <div className="grid grid-cols-7 gap-2 justify-center max-w-3xl mx-auto">
        {loading ? (
          Array.from({ length: 42 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square w-8 sm:w-10 lg:w-12 rounded-md bg-white/5 animate-pulse"
            />
          ))
        ) : error ? (
          <div className="col-span-7 text-center text-sm text-red-300 py-6">{error}</div>
        ) : (
          daysForGrid.map((day) => {
            const inThisMonth = isSameMonth(day, monthDate)
            const dateStr = format(day, 'yyyy-MM-dd')
            const mood = inThisMonth ? moodsByDate[dateStr] : null
            const moodInfo = getMoodStyles(mood || 'NONE')
            const isToday = isSameDay(day, today)

            return (
              <div
                key={dateStr}
                className={`
                  aspect-square w-8 sm:w-10 lg:w-12 rounded-md border
                  flex flex-col items-center justify-center text-[11px] 
                  ${inThisMonth ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent opacity-40'}
                  ${isToday && inThisMonth ? 'ring-2 ring-pink-400 ring-offset-2 ring-offset-transparent' : ''}
                `}
              >
                <span className="font-medium text-white/80 leading-none">
                  {format(day, 'd')}
                </span>

                {inThisMonth && (
                  <Image
                    src={moodInfo.seal}
                    alt={mood || 'NONE'}
                    width={20}
                    height={20}
                    className={`mt-1 ${mood ? '' : 'opacity-40'}`}
                  />
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
