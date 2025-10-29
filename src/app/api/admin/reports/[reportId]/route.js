// src/app/api/admin/reports/[reportId]/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { isAdminEmail } from '@/lib/authz';
import prisma from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';
import { assertSameOrigin } from '@/lib/same-origin';

export async function DELETE(req, ctx) {
  const limited = await enforceRateLimit(req, 'strict'); if (limited) return limited;
  const badOrigin = assertSameOrigin(req); if (badOrigin) return badOrigin;

  try {
    const session = await getServerSession(authOptions);
    if (!isAdminEmail(session?.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ⬇️ Next 15: params trebuie așteptat
    const { reportId, id: idParam } = await ctx.params;
    const id = reportId ?? idParam;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await prisma.report.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/reports/[reportId] failed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// 405 pentru metode nepermise (opțional)
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
