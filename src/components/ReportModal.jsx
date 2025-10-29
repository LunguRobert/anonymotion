import { useState } from 'react'

const predefinedReasons = [
  'Toxic content',
  'Spam or misleading',
  'Offensive language',
  'False information',
  'Other...',
]

export default function ReportModal({ postId, onClose }) {
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const isCustom = reason === 'Other...'

  const submitReport = async () => {
    const finalReason = isCustom ? customReason.trim() : reason
    if (!finalReason) return

    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, reason: finalReason }),
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4 text-gray-800">
        <h3 className="text-lg font-semibold">Report Post</h3>

        <div className="space-y-2">
          {predefinedReasons.map((r) => (
            <label key={r} className="flex items-center gap-2">
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => {
                  setReason(r)
                  if (r !== 'Other...') setCustomReason('')
                }}
              />
              {r}
            </label>
          ))}

          {isCustom && (
            <textarea
              placeholder="Enter your reason..."
              className="w-full border rounded p-2 text-sm"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm text-gray-500">Cancel</button>
          <button
            onClick={submitReport}
            className="bg-red-600 text-white px-4 py-1 rounded text-sm disabled:opacity-50"
            disabled={!reason || (isCustom && !customReason.trim())}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
