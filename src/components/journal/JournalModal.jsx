'use client'

import { useState, useMemo } from 'react'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import clsx from 'clsx'

const EMOTIONS = [
  { value: 'HAPPY',   label: '😊 Happy'   },
  { value: 'SAD',     label: '😢 Sad'     },
  { value: 'ANGRY',   label: '😠 Angry'   },
  { value: 'ANXIOUS', label: '😬 Anxious' },
  { value: 'NEUTRAL', label: '😐 Neutral' },
]

export default function JournalModal({ onClose, onAdd, entryToEdit = null, onDelete }) {
  const editId = entryToEdit?.id ?? null
  const isEdit = !!editId

  const [content, setContent] = useState(entryToEdit?.content || '')
  const [mood, setMood]       = useState(entryToEdit?.mood || 'NEUTRAL')
  const [loading, setLoading] = useState(false)
  const canSubmit = useMemo(() => content.trim().length > 0 && !loading, [content, loading])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)

    try {
      const res = await fetch('/api/journal', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEdit
            ? { id: editId, content: content.trim(), mood }
            : { content: content.trim(), mood }
        ),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(data?.error || 'Something went wrong')
        return
      }

      // Prefer server payload if present; otherwise build a local fallback
      const updated =
        data.entry ??
        (isEdit
          ? { ...entryToEdit, content: content.trim(), mood }
          : {
              id: data.id || `tmp_${Date.now()}`,
              content: content.trim(),
              mood,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })

      onAdd?.(updated)
      onClose?.()
    } catch (err) {
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!isEdit || !editId) return
    if (!confirm('Delete this entry?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/journal?id=${encodeURIComponent(editId)}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(data?.error || 'Delete failed')
        return
      }
      onDelete?.(editId)
      onClose?.()
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onClose={loading ? () => {} : onClose} className="fixed inset-0 z-50">
      <div className="flex min-h-screen items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6">
        <Dialog.Panel
          className="relative w-full max-w-lg rounded-2xl border border-secondary bg-card p-5 shadow-xl"
          aria-busy={loading ? 'true' : 'false'}
        >
          <button
            onClick={onClose}
            disabled={loading}
            className={clsx(
              'absolute right-3 top-3 rounded-full border border-secondary px-2 py-0.5 text-xs text-inverted transition',
              loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-surface'
            )}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <Dialog.Title className="mb-4 text-center text-lg font-semibold text-inverted">
            {isEdit ? 'Edit entry' : 'New journal entry'}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mood chips (server expects `mood`) */}
            <div>
              <label className="mb-2 block text-sm text-muted">How are you feeling?</label>
              <div className="flex flex-wrap gap-2">
                {EMOTIONS.map(e => {
                  const active = mood === e.value
                  return (
                    <button
                      type="button"
                      key={e.value}
                      onClick={() => setMood(e.value)}
                      disabled={loading}
                      className={clsx(
                        'rounded-full border px-3 py-1 text-sm transition',
                        active
                          ? 'border-secondary bg-surface text-inverted'
                          : 'border-secondary text-muted hover:bg-surface',
                        loading && 'opacity-60 cursor-not-allowed'
                      )}
                      aria-pressed={active}
                    >
                      {e.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="mb-2 block text-sm text-muted">What’s on your mind?</label>
              <textarea
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write freely, this space is yours…"
                className="w-full rounded-xl border border-secondary bg-surface p-3 text-inverted placeholder:text-muted focus:outline-none focus:ring-2 ring-primary"
                disabled={loading}
              />
              <div className="mt-1 text-right text-xs text-muted">{content.length} characters</div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              {isEdit ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className={clsx(
                    'text-sm text-danger hover:underline',
                    loading && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  Delete
                </button>
              ) : (
                <span />
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className={clsx(
                  'rounded-full px-5 py-2 text-sm text-inverted transition',
                  canSubmit ? 'bg-primary hover:opacity-90' : 'bg-primary/60 cursor-not-allowed'
                )}
              >
                {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Add entry'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
