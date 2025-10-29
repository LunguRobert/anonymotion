// app/api/auth/[...nextauth]/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';     // 👈 important
export const fetchCache = 'force-no-store'; // 👈 important
export const revalidate = 0;                // (opțional) dar util în dev

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { enforceRateLimit } from '@/lib/rate-limit';

const handler = NextAuth(authOptions);

// GET rămâne handler-ul NextAuth
export const GET = handler;

// POST cu rate-limit, dar pasăm mai departe `ctx` către NextAuth
export async function POST(req, ctx) {
  const limited = await enforceRateLimit(req, 'login');
  if (limited) return limited;
  return handler(req, ctx);
}
