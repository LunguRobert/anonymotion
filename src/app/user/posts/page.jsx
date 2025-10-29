// app/user/posts/page.jsx — SERVER COMPONENT (fără "use client")
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import MyPosts from '@/components/user/MyPosts'

export const metadata = {
  title: 'My Posts',
}

export default async function MyPostsPage() {
  // 1) auth pe server
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/user/posts')
  }

  // 2) plan real din DB (FREE | PREMIUM)
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })
  const isPremium = me?.plan === 'PREMIUM'

  // 3) pasăm flag-ul în client component
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <MyPosts isPremium={isPremium} />
    </main>
  )
}
