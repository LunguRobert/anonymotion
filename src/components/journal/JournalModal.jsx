'use client'

import { useState } from 'react'
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
  const isEdit = !!entryToEdit
  const [content, setContent] = useState(entryToEdit?.content || '')
  const [mood, setMood] = useState(entryToEdit?.mood || 'NEUTRAL')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)

    const res = await fetch('/api/journal', {
      method: isEdit ? 'PUT' : 'POST',
      body: JSON.stringify({ id: entryToEdit?.id, content, mood }),
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await res.json().catch(() => ({}))

    if (res.ok) { onAdd?.(data.entry); onClose?.() }
    else alert('Something went wrong')

    setLoading(false)
  }

  return (
    <Dialog open onClose={onClose} className="fixed inset-0 z-50">
      <div className="flex min-h-screen items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6">
        <Dialog.Panel className="relative w-full max-w-lg rounded-2xl border border-secondary bg-card p-5 shadow-xl">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full border border-secondary px-2 py-0.5 text-xs text-inverted hover:bg-surface transition"
          >
            <X className="h-4 w-4" />
          </button>

          <Dialog.Title className="mb-4 text-center text-lg font-semibold text-inverted">
            {isEdit ? 'Edit entry' : 'New journal entry'}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* mood chips */}
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
                      className={clsx(
                        'rounded-full border px-3 py-1 text-sm transition',
                        active
                          ? 'border-secondary bg-surface text-inverted'
                          : 'border-secondary text-muted hover:bg-surface'
                      )}
                      aria-pressed={active}
                    >
                      {e.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* content */}
            <div>
              <label className="mb-2 block text-sm text-muted">What’s on your mind?</label>
              <textarea
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write freely, this space is yours…"
                className="w-full rounded-xl border border-secondary bg-surface p-3 text-inverted placeholder:text-muted focus:outline-none focus:ring-2 ring-primary"
              />
              <div className="mt-1 text-right text-xs text-muted">{content.length} characters</div>
            </div>

            <div className="flex items-center justify-between">
              {isEdit ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm('Delete this entry?')) return
                    setLoading(true)
                    const res = await fetch(`/api/journal?id=${entryToEdit.id}`, { method: 'DELETE' })
                    if (res.ok) { onDelete?.(entryToEdit.id); onClose?.() }
                    else alert('Delete failed')
                    setLoading(false)
                  }}
                  className="text-sm text-danger hover:underline"
                >
                  Delete
                </button>
              ) : <span />}

              <button
                type="submit"
                disabled={loading}
                className={clsx(
                  'rounded-full px-5 py-2 text-sm text-inverted transition',
                  loading ? 'bg-primary/60' : 'bg-primary hover:opacity-90'
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
