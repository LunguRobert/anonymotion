'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AdminSearchBar({ placeholder = 'Search…', defaultValue = '' }) {
  const router = useRouter()
  const sp = useSearchParams()
  const [value, setValue] = useState(defaultValue)

  // Debounce 300ms
  const debounced = useMemo(() => {
    let t
    return (v) => {
      clearTimeout(t)
      t = setTimeout(() => {
        const qs = new URLSearchParams(sp.toString())
        if (v.trim()) qs.set('q', v.trim())
        else qs.delete('q')
        qs.set('page', '1') // reset pagination
        router.push(`/admin/blog?${qs.toString()}`)
      }, 300)
    }
  }, [router, sp])

  useEffect(() => { debounced(value) }, [value, debounced])

  return (
    <div className="relative w-full md:max-w-md">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-secondary bg-card px-4 py-2 text-sm text-inverted placeholder:text-muted"
        aria-label="Search posts"
      />
      {/* optional: small clear button */}
      {value ? (
        <button
          onClick={() => setValue('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-secondary px-2 py-0.5 text-xs text-inverted"
        >
          Clear
        </button>
      ) : null}
    </div>
  )
}
