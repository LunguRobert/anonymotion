// src/app/api/admin/users/[userId]/block/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { isAdminEmail } from '@/lib/authz';
import prisma from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';
import { assertSameOrigin } from '@/lib/same-origin';

export async function POST(req, ctx) {
  const limited = await enforceRateLimit(req, 'strict'); if (limited) return limited;
  const badOrigin = assertSameOrigin(req); if (badOrigin) return badOrigin;

  try {
    const session = await getServerSession(authOptions);
    if (!isAdminEmail(session?.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ⬇️ Next 15: params trebuie așteptat
    const { userId, id: idParam } = await ctx.params;
    const targetUserId = userId ?? idParam;
    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    // acceptă JSON sau form-data
    let blocked = false;
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      blocked = !!body.blocked;
    } else {
      const fd = await req.formData().catch(() => null);
      blocked = (fd?.get('blocked') ?? 'false') === 'true';
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { blocked },
      select: { id: true },
    });

    if (blocked) {
      await prisma.session.deleteMany({ where: { userId: updated.id } });
    }

    return NextResponse.json({ ok: true, blocked });
  } catch (err) {
    console.error('POST /api/admin/users/[userId]/block failed:', err);
    if (String(err?.code) === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
