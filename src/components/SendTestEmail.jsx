'use client'

import { useState } from 'react'

export default function SendTestEmail() {
  const [status, setStatus] = useState(null)

  const handleSend = async () => {
    setStatus('Sending...')
    const res = await fetch('/api/test-mail', { method: 'POST' })
    if (res.ok) {
      setStatus('Sent successfully ✅')
    } else {
      setStatus('Error ❌')
    }
  }

  return (
    <div className="p-4">
      <button
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Trimite email de test
      </button>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </div>
  )
}
