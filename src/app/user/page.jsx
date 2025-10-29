// app/user/page.jsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import UserHome from '@/components/user/UserHome'
import FeedbackButton from '@/components/FeedbackButton'

export default async function UserPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-secondary bg-card p-6 text-center">
          <h1 className="text-2xl font-semibold text-inverted">Welcome</h1>
          <p className="text-sm text-muted mt-1">Please sign in to access your space.</p>
          <a
            href="/signin"
            className="inline-block mt-4 rounded-full bg-pink-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-pink-700 transition"
          >
            Sign in
          </a>
        </div>
      </main>
    )
  }

  // Pasăm doar numele + timezone din token (dacă îl ai în session.user)
  const name = session.user.name || 'friend'
  const timezone = session.user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <UserHome name={name} timezone={timezone} />
      <div className="fixed bottom-4 right-4 z-[99998]">
        <FeedbackButton origin="user" />
      </div>
    </main>
  )
}
