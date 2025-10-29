'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminRowActions({ slug, published }) {
  const router = useRouter()

  async function togglePublish(next) {
    try {
      const res = await fetch(`/api/blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: next }),
      })
      if (!res.ok) throw new Error('Failed')
      router.refresh()
    } catch {
      alert('Failed to update publish status')
    }
  }

  async function remove() {
    if (!confirm('Delete this post?')) return
    try {
      const res = await fetch(`/api/blog/${slug}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      router.refresh()
    } catch {
      alert('Failed to delete')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={`/blog/${slug}`} className="rounded-full border border-secondary px-3 py-1 text-sm text-inverted hover:bg-card transition">
        View
      </Link>
      <Link href={`/admin/blog/${slug}/edit`} className="rounded-full border border-secondary px-3 py-1 text-sm text-inverted hover:bg-card transition">
        Edit
      </Link>
      <button
        onClick={() => togglePublish(!published)}
        className="rounded-full bg-primary px-3 py-1 text-sm text-inverted hover:opacity-90 transition"
      >
        {published ? 'Unpublish' : 'Publish'}
      </button>
      <button
        onClick={remove}
        className="rounded-full border border-secondary px-3 py-1 text-sm text-inverted hover:bg-card transition"
      >
        Delete
      </button>
    </div>
  )
}
