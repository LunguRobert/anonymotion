// lib/journalLock.js
import { cookies } from 'next/headers'

export function isJournalUnlocked() {
  return cookies().get('journal-unlocked')?.value === '1'
}
