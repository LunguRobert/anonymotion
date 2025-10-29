import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter' // (NextAuth v4). Dacă folosești v5 -> '@auth/prisma-adapter'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { isAdminEmail } from '@/lib/authz'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  allowDangerousEmailAccountLinking: false, // opțional; vezi doc NextAuth

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim()
        const password = credentials?.password || ''
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null
        if (user.blocked) return null
        if (!user.emailVerified) return null
        if (!user.password) return null

        const ok = await bcrypt.compare(password, user.password)
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  pages: {
    signIn: '/auth/signin',
    // error: '/auth/error', // dacă ai pagină custom
  },

callbacks: {
  // 1) Blochează userii marcați "blocked"
  async signIn({ user }) {
    if (!user?.email) return false
    const existing = await prisma.user.findUnique({
      where: { email: user.email },
      select: { blocked: true },
    })
    if (existing?.blocked) return false
    return true
  },

  // 2) JWT: pe primul pas (când 'user' există) citește atributele din DB
  async jwt({ token, user }) {
    if (user?.email) {
      const db = await prisma.user.findUnique({
        where: { email: user.email },
        select: {
          id: true, plan: true, timezone: true, emailVerified: true,
          name: true, image: true, blocked: true,
        },
      })

      // asigură identificatorul — folosim sub și uid (redundanță utilă)
      token.sub = db?.id || token.sub
      token.uid = db?.id || token.uid

      // metadate utile în UI
      token.plan = db?.plan || 'FREE'
      token.tz = db?.timezone || null
      token.emailVerified = !!db?.emailVerified
      token.blocked = !!db?.blocked
      token.name = db?.name || token.name
      token.picture = db?.image || token.picture
      token.isAdmin = isAdminEmail(user.email)
      token.email = user.email
    }
    return token
  },

  // 3) Session: propagă id-ul în session.user.id (din sub/uid)
  async session({ session, token }) {
    if (!session.user) session.user = {}
    session.user.id = token?.sub || token?.uid || session.user.id || null
    session.user.email = token?.email || session.user.email || null
    session.user.plan = token?.plan || 'FREE'
    session.user.timezone = token?.tz || null
    session.user.emailVerified = !!token?.emailVerified
    session.user.blocked = !!token?.blocked
    session.user.isAdmin = !!token?.isAdmin
    return session
  },
},


  events: {
    // Se apelează după ce contul OAuth a fost conectat (user sigur există)
    async linkAccount({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          })
        } catch (e) {
          console.error('events.linkAccount failed', e)
        }
      }
    },

    // Se apelează după ce PrismaAdapter a creat userul în DB (prima conectare OAuth)
    async createUser({ user }) {
      // schema are deja plan @default(FREE), deci nu e musai să faci nimic aici.
      // poți seta valori inițiale (badge-uri de bun venit, etc.) dacă vrei.
    },
  },

  // debug: true,
}
