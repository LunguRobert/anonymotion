// components/user/UserNav.jsx
'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

export function UserNav({ className = '' }) {
  const { data: session } = useSession()
  const user = session?.user
  if (!user) return null

  const firstName = user.name?.split(' ')?.[0] || 'User'

  return (
    <Link
      href="/user"
      className={[
        'flex items-center gap-3 rounded-full border border-secondary/60 bg-card/60 px-3 py-1.5 min-w-0',
        className,
      ].join(' ')}
      aria-label="User"
    >
      {/* Show name on mobile too, with truncation */}
      <span
        className="text-xs sm:text-sm text-muted truncate max-w-[7rem] sm:max-w-none"
        title={user.name || 'User'}
      >
        {firstName}
      </span>

      {/* Avatar (with fallback) */}
      <div className="relative h-8 w-8 shrink-0">
        {user.image ? (
          <Image
            src={user.image}
            alt="User avatar"
            fill
            sizes="32px"
            className="rounded-full object-cover"
            priority={false}
          />
        ) : (
          <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary/50 text-xs text-inverted">
            {firstName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Status dot (inline style so it works everywhere) */}
        <span
          className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: '#22c55e',                   // green
            boxShadow: '0 0 0 2px var(--background, #0b0f14)', // ring in bg color
          }}
          aria-label="Online"
          title="Online"
        />
      </div>
    </Link>
  )
}
