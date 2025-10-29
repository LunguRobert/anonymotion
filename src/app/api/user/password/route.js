// app/api/user/password/route.js
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { enforceRateLimit } from '@/lib/rate-limit'
import { assertSameOrigin } from '@/lib/same-origin'

function isStrongPassword(pw) {
  // min 10, cel puțin 1 literă mică, 1 literă mare, 1 cifră, 1 simbol
  return (
    typeof pw === 'string' &&
    pw.length >= 10 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /\d/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  )
}

export async function POST(req) {
  const limited = await enforceRateLimit(req, 'strict'); if (limited) return limited;
  const badOrigin = assertSameOrigin(req); if (badOrigin) return badOrigin;

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = session.user.id

    // verificăm providerul
    try {
      const acc = await prisma.account.findFirst({ where: { userId }, select: { provider: true } })
      if (acc?.provider && acc.provider !== 'credentials') {
        return Response.json({ error: 'Password is managed by your provider.' }, { status: 400 })
      }
    } catch {}

    const { currentPassword, newPassword, confirmPassword } = await req.json().catch(() => ({}))

    if (!currentPassword || !newPassword || !confirmPassword) {
      return Response.json({ error: 'All fields are required.' }, { status: 400 })
    }
    if (newPassword !== confirmPassword) {
      return Response.json({ error: 'Passwords do not match.' }, { status: 400 })
    }
    if (!isStrongPassword(newPassword)) {
      return Response.json({
        error: 'Password must be at least 10 characters and include uppercase, lowercase, number, and symbol.',
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } })
    if (!user?.password) {
      return Response.json({ error: 'No password set on this account.' }, { status: 400 })
    }

    const ok = await bcrypt.compare(currentPassword, user.password)
    if (!ok) return Response.json({ error: 'Current password is incorrect.' }, { status: 400 })

    const nextHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: userId }, data: { password: nextHash } })

    return Response.json({ ok: true })
  } catch (e) {
    console.error('POST /api/user/password', e)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
