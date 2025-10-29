// components/notifications/NotificationsPanel.jsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { useNotifications } from './NotificationsProvider'
import { reactionMap } from '@/lib/reactions'

export default function NotificationsPanel({ onClose }) {
  const { items, markAllRead, clear } = useNotifications() || { items: [] }

  // mark unread as read when panel opens
  useEffect(() => { markAllRead?.() }, [])

  if (!items?.length) {
    return (
      <div className="p-4">
        <p className="text-sm text-white/70">
          You're all caught up. Reactions to your posts will appear here in real time.
        </p>
      </div>
    )
  }

  // group by postId
  const grouped = groupByPost(items)

  return (
    <div className="max-h-[70vh] divide-y divide-white/10 overflow-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-card/90 px-4 py-2 backdrop-blur">
        <span className="text-xs text-white/60">Latest reactions</span>
        <button
          onClick={clear}
          className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 hover:bg-white/10"
        >
          Clear
        </button>
      </div>

      {grouped.map((g) => (
        <div key={g.postId} className="flex items-start gap-3 p-4 hover:bg-white/5">
          {/* reaction icons stack */}
          <div className="mt-1 flex -space-x-2">
            {g.topReactions.slice(0, 3).map((r, idx) => (
              <ReactionIcon key={r.name + idx} reaction={r.name} />
            ))}
          </div>

          <div className="min-w-0 flex-1">
            {/* anonim: fără nume actor */}
            <p className="truncate text-sm text-white/90">
              <strong className="font-medium text-white">{g.count} {g.count === 1 ? 'person' : 'people'}</strong> reacted to your post
              {g.topReactions.length ? (
                <span className="text-white/80">
                  {' '}— {g.topReactions.slice(0, 2).map(r => prettyLabel(r.name)).join(', ')}
                </span>
              ) : null}
            </p>

            {g.preview ? (
              <p className="mt-1 line-clamp-2 text-xs text-white/60">“{g.preview}”</p>
            ) : null}

            <div className="mt-2 flex items-center gap-2">
              <Link
                href="/user/posts"
                onClick={onClose}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/90 hover:bg-white/10"
              >
                View post
              </Link>
            </div>
          </div>

          <time className="shrink-0 text-[11px] text-white/50">just now</time>
        </div>
      ))}
    </div>
  )
}

/* ---------------- helpers ---------------- */

function groupByPost(items) {
  // items: [{ id, postId, reaction, preview, createdAt, ... }]
  const map = new Map()
  for (const it of items) {
    const g = map.get(it.postId) || { postId: it.postId, count: 0, preview: it.preview || '', reactions: new Map() }
    g.count += 1
    if (!g.preview && it.preview) g.preview = it.preview
    g.reactions.set(it.reaction, (g.reactions.get(it.reaction) || 0) + 1)
    map.set(it.postId, g)
  }
  // transform to array + compute top reactions
  const out = Array.from(map.values()).map(g => {
    const topReactions = Array.from(g.reactions.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, cnt]) => ({ name, cnt }))
    return { ...g, topReactions }
  })
  // keep ordering by first appearance in items (recent first as they came)
  const order = []
  const seen = new Set()
  for (const it of items) {
    if (!seen.has(it.postId)) { order.push(it.postId); seen.add(it.postId) }
  }
  out.sort((a, b) => order.indexOf(a.postId) - order.indexOf(b.postId))
  return out
}

function ReactionIcon({ reaction }) {
  const file = iconForReaction(reaction)
  if (!file) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px]">
        ✨
      </span>
    )
  }
  return (
    <Image
      src={file}
      alt={reaction}
      width={28}
      height={28}
      className="h-7 w-7 rounded-full object-cover"
    />
  )
}

// map reaction name -> file path using your /lib/reactions.js
function iconForReaction(name) {
  for (const group of Object.values(reactionMap)) {
    const hit = group.find(r => r.name === name)
    if (hit) return hit.file
  }
  return null
}

function prettyLabel(type) {
  switch (type) {
    case 'support': return 'support'
    case 'hug': return 'a hug'
    case 'heart': return 'a heart'
    case 'like': return 'a like'
    case 'watch': return 'an eye'
    case 'think': return 'a thought'
    case 'thinkclear': return 'clarity'
    case 'broken': return 'broken heart'
    case 'empathy': return 'empathy'
    case 'imhere': return `I’m here`
    case 'understand': return 'understanding'
    case 'supportive': return 'supportive'
    case 'calm': return 'calm'
    case 'agreeangry': return 'agreement'
    case 'angry': return 'anger'
    case 'disapprove': return 'disapproval'
    case 'solidarity': return 'solidarity'
    case 'congrat': return 'congrats'
    case 'love': return 'love'
    case 'smile': return 'a smile'
    case 'super': return 'super'
    default: return type
  }
}
