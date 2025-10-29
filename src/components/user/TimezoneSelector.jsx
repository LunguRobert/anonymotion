'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const timezones = Intl.supportedValuesOf('timeZone')

export default function TimezoneSelector() {
  const [selected, setSelected] = useState('Europe/Bucharest')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('timezone', selected)

    const res = await fetch('/api/user/timezone', {
      method: 'POST',
      body: formData
    })

    if (res.ok) {
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-yellow-100 border border-yellow-300 rounded-xl p-6 space-y-4 shadow max-w-xl mx-auto text-center"
    >
      <p className="text-yellow-900 text-sm font-medium">
        🌍 Select your timezone to personalize your dashboard:
      </p>

      <div className="relative">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          name="timezone"
          required
          className="w-full appearance-none p-3 pl-4 pr-10 rounded-lg bg-white text-sm text-gray-800 shadow focus:ring-2 focus:ring-yellow-400 focus:outline-none"
        >
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-3 text-gray-500 pointer-events-none">⌄</div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-full text-white text-sm shadow transition ${
          loading
            ? 'bg-yellow-300 cursor-not-allowed'
            : 'bg-yellow-600 hover:bg-yellow-700'
        }`}
      >
        {loading ? 'Saving...' : 'Save Timezone'}
      </button>
    </form>
  )
}
