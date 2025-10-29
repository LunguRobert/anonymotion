// app/feed/page.jsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import FeedClient from '@/components/FeedClient'

export const revalidate = 0;

export default async function FeedPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/signin')

  return (
    <main className="mx-auto max-w-7xl px-4">
      <FeedClient />
    </main>
  )
}
