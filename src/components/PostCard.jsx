'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { reactionMap } from '@/lib/reactions'

function timeAgo(dateStr) {
  const d = new Date(dateStr)
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  return `${days}d ago`
}

const emotionGradients = {
  NEUTRAL: 'from-gray-600 via-gray-500 to-gray-400',
  HAPPY: 'from-yellow-400 via-pink-400 to-orange-400',
  SAD: 'from-blue-500 via-indigo-600 to-purple-700',
  ANGRY: 'from-red-600 via-orange-700 to-red-800',
  ANXIOUS: 'from-teal-500 via-purple-500 to-fuchsia-600',
}

export default function PostCard({ post, fx = {}, onReport }) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [reactions, setReactions] = useState(post.reactions || [])
  const [expanded, setExpanded] = useState(false)

  // highlight scurt pe card când părintelui îi schimbă postarea (ex. SSE)
  const [blink, setBlink] = useState(false)
  useEffect(() => {
    if (!post.__flash) return
    setBlink(true)
    const t = setTimeout(() => setBlink(false), 600)
    return () => clearTimeout(t)
  }, [post.__flash])

  // sincronizează local când vin reacții noi din părinte (SSE / fetch)
  useEffect(() => {
    setReactions(post.reactions || [])
  }, [post.reactions])

  // efecte locale pentru buton (pop + bulă) când utilizatorul apasă
  const [localFx, setLocalFx] = useState({}) // { [type]: { key, op } }


  const currentUserReaction = reactions.find(r => r.userId === userId)
  const counts = useMemo(() => {
    const acc = {}
    for (const r of reactions) acc[r.type] = (acc[r.type] || 0) + 1
    return acc
  }, [reactions])

  const reactionOptions = reactionMap[post.emotion] || []
  const gradient = emotionGradients[post.emotion] || 'from-slate-600 to-slate-800'

  async function handleReact(type) {
    if (!session) return alert('Please sign in.')

    const prev = reactions
    const mine = prev.find(r => r.userId === userId)
    const sameType = mine?.type === type

    // 🔄 optimistic: construim noul array
    let next = prev.filter(r => r.userId !== userId)
    let op = 'add'
    if (sameType) {
      // toggle off
      op = 'remove'
      // (nu adăugăm nimic)
    } else {
      // replace (dacă exista alt tip, e deja scos din filter-ul de mai sus)
      next = [...next, { id: `me_${userId}_${type}`, userId, type, postId: post.id }]
    }

    // setează efectul vizual local pe tipul apăsat
    const fxKey = `${type}_${Date.now()}`
    setLocalFx(cur => ({ ...cur, [type]: { key: fxKey, op } }))

    // aplică local
    setReactions(next)

    // trimite la server
    const res = await fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, type })
    })

    if (!res.ok) {
      // rollback pe eșec
      setReactions(prev)
      // șterge efectul local dacă încă e același key
      setTimeout(() => {
        setLocalFx(cur => {
          if (cur[type]?.key !== fxKey) return cur
          const c = { ...cur }; delete c[type]; return c
        })
      }, 10)
    }
  }


  return (
      <motion.article
        layout
        className={`relative h-full rounded-3xl border border-secondary bg-card shadow-sm transition ${blink ? 'flash-bg' : ''}`}
      >
      {/* Content with emotion gradient */}
      <div
        onClick={() => setExpanded(!expanded)}
        className={`m-3 rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white select-text cursor-pointer`}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-black/25 px-2 py-0.5 text-xs">#{post.emotion}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onReport?.() }}
            title="Report post"
            className="rounded-full bg-black/20 px-2 py-0.5 text-xs text-white/90 transition hover:bg-black/30"
          >
            Report
          </button>
        </div>

        <div className={`whitespace-pre-wrap text-base leading-relaxed ${expanded ? '' : 'line-clamp-6'}`}>
          {post.content}
        </div>

        {!expanded && post.content.length > 260 && (
          <p className="pointer-events-none mt-2 text-center text-sm italic text-white/80">… Read more</p>
        )}

        <div className="mt-4 text-right text-[11px] text-white/80">
          {timeAgo(post.createdAt)}
        </div>
      </div>

      {/* Reactions */}
      <div className="px-4 pb-4">
        <div
          className="flex flex-wrap items-center justify-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
        {reactionOptions.map(({ name, file }) => {
          const active = currentUserReaction?.type === name

          // efect din SSE (din FeedClient) + efect local (la click)
          const extFx = fx?.[name]
          const locFx = localFx[name]
          const f = locFx || extFx
          const bump = !!f
          const bubble = f?.op === 'add' ? '+1' : f?.op === 'remove' ? '−1' : null

          return (
            <div key={name} className="relative">
              <button
                onClick={() => handleReact(name)}
                className={[
                  'transition-transform hover:scale-110',
                  active ? 'opacity-100' : 'opacity-45',
                  bump ? 'reaction-pop' : ''
                ].join(' ')}
                title={name}
                aria-pressed={active}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={file} alt={`${name} reaction`} className="h-8 w-8 object-contain" />
                {counts[name] ? (
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted">
                    {counts[name]}
                  </span>
                ) : null}
              </button>

              {bubble && (
                <span
                  className={[
                    'pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-semibold',
                    f.op === 'add' ? 'text-success' : 'text-danger',
                    'float-chip'
                  ].join(' ')}
                >
                  {bubble}
                </span>
              )}
            </div>
          )
        })}

        </div>
      </div>
    </motion.article>
  )
}
