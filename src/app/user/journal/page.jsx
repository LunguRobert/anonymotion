// app/user/journal/page.jsx  — SERVER COMPONENT
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import JournalClient from '@/components/journal/JournalClient' // componenta client

export const metadata = {
  title: 'Your Journal',
}

export default async function JournalPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/user/journal')
  }

  // plan real din DB (FREE | PREMIUM)
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })
  const isPremium = me?.plan === 'PREMIUM'

  return <JournalClient isPremium={isPremium} />
}
