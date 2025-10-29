// app/api/my/posts/[id]/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';
import { assertSameOrigin } from '@/lib/same-origin';

export async function DELETE(req, ctx) {
  const limited = await enforceRateLimit(req, 'strict'); if (limited) return limited;
  const badOrigin = assertSameOrigin(req); if (badOrigin) return badOrigin;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ⬇️ Next 15: așteaptă params
    const { id: postId } = await ctx.params;
    if (!postId) {
      return Response.json({ error: 'Missing id' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    // 404 pentru „nu există” sau „nu e al tău” (evită leak de existență)
    if (!post || post.userId !== session.user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.reaction.deleteMany({ where: { postId } }),
      prisma.report.deleteMany({ where: { postId } }), // dacă vrei să cureți și rapoartele
      prisma.post.delete({ where: { id: postId } }),
    ]);

    return Response.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/my/posts/[id] error:', e);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
