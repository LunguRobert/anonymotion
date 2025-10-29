// app/auth/signin/page.jsx
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import SignInClient from '@/components/signin/SignInClient'

export const metadata = {
  alternates: { canonical: '/auth/signin' },
  title: 'Sign in',
  description: 'Access your mindful journal securely.',
}

export default async function SignInPage({ searchParams }) {
  // dacă e logat, redirecționează (folosește callbackUrl dacă e prezent)
  const session = await getServerSession(authOptions)
  if (session?.user) {
    const cb =
      (typeof searchParams?.get === 'function' ? searchParams.get('callbackUrl') : searchParams?.callbackUrl) ||
      '/user'
    redirect(cb)
  }

  // altfel, arată pagina de sign-in
  return (
    <Suspense fallback={null}>
      <SignInClient />
    </Suspense>
  )
}
