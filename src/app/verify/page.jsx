// app/verify/page.jsx — Server Component

import { Suspense } from 'react'
import VerifyClient from '@/components/verify/VerifyClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Email verification',
  description: 'Verify your email to activate the account.',
  alternates: { canonical: '/verify' },
}

function Wrapper({ children }) {
  return (
    <main className="relative flex justify-center mx-auto w-full max-w-7xl px-6 py-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'var(--lamp-glow)' }} />
      <div className="rounded-3xl border border-secondary/60 bg-card/70 p-8 backdrop-blur">
        {children}
      </div>
    </main>
  )
}

export default function VerifyPage() {
  return (
    <Wrapper>
      {/* IMPORTANT: client fetch of ?status=... în Suspense */}
      <Suspense fallback={
        <div className="space-y-3">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-6 w-2/3 mx-auto rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-1/2 mx-auto rounded bg-white/10 animate-pulse" />
        </div>
      }>
        <VerifyClient />
      </Suspense>
    </Wrapper>
  )
}
