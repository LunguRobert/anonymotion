'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReportActions({ reportId, postId, authorId, authorBlocked }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function doFetch(url, options) {
    setBusy(true)
    try {
      const res = await fetch(url, options)
      if (!res.ok) throw new Error('Request failed')
      router.refresh()
    } catch (e) {
      alert('Operation failed')
    } finally {
      setBusy(false)
    }
  }

  async function dismissReport() {
    await doFetch(`/api/admin/reports/${reportId}`, { method: 'DELETE' })
  }

  async function deletePost() {
    if (!postId) return
    if (!confirm('Delete this post? This cannot be undone.')) return
    await doFetch(`/api/admin/posts/${postId}`, { method: 'DELETE' })
  }

  async function toggleBlockUser() {
    if (!authorId) return
    const next = !authorBlocked
    if (next && !confirm('Block this user and invalidate their sessions?')) return
    await doFetch(`/api/admin/users/${authorId}/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocked: next })
    })
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        onClick={dismissReport}
        disabled={busy}
        className="rounded-full border border-secondary px-3 py-1 text-sm text-inverted hover:bg-surface transition disabled:opacity-50"
      >
        Dismiss
      </button>

      <button
        onClick={deletePost}
        disabled={busy || !postId}
        className="rounded-full border border-secondary px-3 py-1 text-sm text-inverted hover:bg-surface transition disabled:opacity-50"
      >
        Delete post
      </button>

      {authorId ? (
        <button
          onClick={toggleBlockUser}
          disabled={busy}
          className={
            authorBlocked
              ? 'rounded-full border border-secondary px-3 py-1 text-sm text-inverted hover:bg-surface transition disabled:opacity-50'
              : 'rounded-full bg-primary px-3 py-1 text-sm text-inverted hover:opacity-90 transition disabled:opacity-50'
          }
        >
          {authorBlocked ? 'Unblock user' : 'Block user'}
        </button>
      ) : null}
    </div>
  )
}
