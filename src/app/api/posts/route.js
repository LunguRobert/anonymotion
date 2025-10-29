// app/api/posts/route.js
export const runtime = 'nodejs';

import prisma from '@/lib/prisma';
import { containsBadWords } from '@/utils/wordFilter';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { enforceRateLimit } from '@/lib/rate-limit';
import { broadcast } from '@/lib/realtime';
import { revalidateTag } from 'next/cache';

export async function GET(req) {
  const limited = await enforceRateLimit(req, 'common');
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '9', 10);
  const before = searchParams.get('before');
  const emotion = searchParams.get('emotion');

  const where = {
    ...(emotion && { emotion }),
    ...(before && { createdAt: { lt: new Date(before) } }),
  };

  const posts = await prisma.post.findMany({
    where,
    include: { reactions: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return Response.json(posts);
}

export async function POST(req) {
    // 1) ia sesiunea
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}

// 1.1) throttle corect: 1 post la 5 minute per UTILIZATOR (bazat pe ultimul post)
const WINDOW_MS = 5 * 60 * 1000;
{
  const last = await prisma.post.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });
  if (last) {
    const resetMs = last.createdAt.getTime() + WINDOW_MS;
    const now = Date.now();
    if (now < resetMs) {
      const retryAfter = Math.ceil((resetMs - now) / 1000);
      return new Response(
        JSON.stringify({ error: 'Please wait before posting again.', retryAt: resetMs }),
        {
          status: 429,
          headers: {
            'content-type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Reset': String(Math.ceil(resetMs / 1000)),
          },
        }
      );
    }
  }
}

// 2) ratelimit PER ACTOR (Upstash/IP) ca protecție secundară
const limited = await enforceRateLimit(req, 'posts5m', session);
if (limited) return limited;



  const { content, emotion } = await req.json();

  if (!content || !emotion) {
    return new Response('Missing content or emotion', { status: 400 });
  }
  if (containsBadWords(content)) {
    return new Response('Inappropriate language detected', { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      content,
      emotion, // valid values: SAD | ANXIOUS | HAPPY | ANGRY | NEUTRAL
      userId: session?.user?.id ?? null,
    },
  });

  try { revalidateTag('feed'); } catch {}
  broadcast('feed', 'newPost', { post });

  return Response.json(post, { status: 201 });
}
