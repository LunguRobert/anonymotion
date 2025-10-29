import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import prisma from '@/lib/prisma'
import { enforceRateLimit } from '@/lib/rate-limit'
import { assertSameOrigin } from '@/lib/same-origin'

async function getAuthProvider(userId) {
  try {
    const acc = await prisma.account.findFirst({ where: { userId }, select: { provider: true } })
    return acc?.provider || 'credentials'
  } catch {
    return 'credentials'
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = session.user.id

    const [user, provider] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, timezone: true, plan: true },
      }),
      getAuthProvider(userId),
    ])
    if (!user) return Response.json({ error: 'Not found' }, { status: 404 })

    return Response.json({
      user, // { email, timezone, plan }
      authProvider: provider,
      canChangePassword: provider === 'credentials',
    })
  } catch (e) {
    console.error('GET /api/user/account', e)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function isValidTimeZone(tz) {
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true } catch { return false }
}

export async function PUT(req) {
  const limited = await enforceRateLimit(req, 'strict'); if (limited) return limited;
  const badOrigin = assertSameOrigin(req); if (badOrigin) return badOrigin;
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = session.user.id

    const { timezone } = await req.json().catch(() => ({}))
    if (!timezone) return Response.json({ error: 'Timezone is required.' }, { status: 400 })
    if (!isValidTimeZone(timezone)) return Response.json({ error: 'Invalid timezone.' }, { status: 400 })

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { timezone },
      select: { id: true, email: true, timezone: true, plan: true },
    })

    return Response.json({ user: updated })
  } catch (e) {
    console.error('PUT /api/user/account', e)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
