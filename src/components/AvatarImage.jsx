'use client'
import { useState } from 'react'

/**
 * Avatar cu fallback local @1x/@2x/@3x.
 * - încearcă src-ul userului; la eroare cade pe fallback.
 * - păstrează dimensiunea fixă => fără layout shift.
 */
export default function AvatarImage({
  src,
  name = 'User',
  size = 32,
  className = '',
}) {
  const [broken, setBroken] = useState(false)

  // fallback-urile generate: 128/256/512 (le-ai pus în /public)
  const fallback1x = '/avatar-fallback-128.png'
  const fallback2x = '/avatar-fallback-256.png'
  const fallback3x = '/avatar-fallback-512.png'

  const useFallback = broken || !src

  return (
    <img
      src={useFallback ? fallback1x : src}
      srcSet={
        useFallback
          ? `${fallback1x} 1x, ${fallback2x} 2x, ${fallback3x} 3x`
          : undefined
      }
      width={size}
      height={size}
      alt={name}
      className={`rounded-full border border-secondary/60 object-cover ${className}`}
      // stabilitate & performanță
      loading="eager"
      decoding="async"
      fetchPriority="high"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
  )
}
