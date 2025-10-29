'use client'

import { signOut } from 'next-auth/react'

export async function appSignOut(options) {
  try {
    await fetch('/api/journal/journal-unlock', { method: 'DELETE', keepalive: true })
  } catch (_) {
    // ignore
  } finally {
    return signOut(options)
  }
}
