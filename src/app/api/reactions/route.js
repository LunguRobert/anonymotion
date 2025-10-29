// app/api/reactions/route.js
export const runtime = 'nodejs';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { enforceRateLimit } from '@/lib/rate-limit';
import { assertSameOrigin } from '@/lib/same-origin';
import { broadcast } from '@/lib/realtime';

// tipurile reale de reacții permise per emoție (exact ca în frontend)
const ALLOWED = {
  NEUTRAL: ['like','watch','think','thinkclear'],
  SAD:     ['hug','broken','support','empathy'],
  ANXIOUS: ['imhere','understand','supportive','calm'],
  ANGRY:   ['agreeangry','angry','disapprove','solidarity'],
  HAPPY:   ['congrat','love','smile','super'],
};

export async function POST(req) {
  // 0) protecții
  const limited = await enforceRateLimit(req, 'strict'); if (limited) return limited;
  const badOrigin = assertSameOrigin(req); if (badOrigin) return badOrigin;

  // 1) auth
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;

  // 2) input
  let body;
  try { body = await req.json(); } catch { /* noop */ }
  const postId = body?.postId;
  const type = body?.type;
  if (!postId || !type) {
    return new Response('Missing postId/type', { status: 400 });
  }

  // 3) post existent + validare tip pentru emoția postării
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, emotion: true, userId: true, content: true },
  });

  if (!post) return new Response('Post not found', { status: 404 });

  const allowed = ALLOWED[post.emotion] || ALLOWED.NEUTRAL;
  if (!allowed.includes(type)) {
    return new Response('Invalid reaction for emotion', { status: 400 });
  }

  // 4) unică (postId, userId): toggle / update / create
  const existing = await prisma.reaction.findUnique({
    where: { postId_userId: { postId, userId } },
    select: { id: true, type: true },
  });

  // 4a) toggle off dacă utilizatorul apasă același tip
  if (existing && existing.type === type) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    // live update
    broadcast('feed', 'reaction', { op: 'remove', postId, userId, type });
    return Response.json({ removed: true }, { status: 200 });
  }

  // 4b) schimbare de tip (replace)
  if (existing && existing.type !== type) {
    const prevType = existing.type;
    const updated = await prisma.reaction.update({
      where: { id: existing.id },
      data: { type },
    });
    // emitem întâi remove pentru vechiul tip, apoi add pentru noul tip
    broadcast('feed', 'reaction', { op: 'remove', postId, userId, type: prevType });
    broadcast('feed', 'reaction', { op: 'add',    postId, userId, type });
    return Response.json(updated, { status: 200 });
  }

  // 4c) nu exista → create
  const created = await prisma.reaction.create({
    data: { postId, userId, type },
  });

  // 🔔 1) broadcast către feed (cum era)
  broadcast('feed', 'reaction', { op: 'add', postId, userId, type });

  // 🔔 2) notificare privată către autorul postării (dacă nu reacționează la propriul post)
  if (post.userId && post.userId !== userId) {
    const payload = {
      id: created.id,
      kind: 'reaction',
      postId,
      reaction: type,
      actorName: session.user.name || 'Someone',
      actorAvatar: session.user.image || null,
      preview: (post.content || '').slice(0, 90),
      createdAt: new Date().toISOString(),
    };

    // Trimite către canalul personalizat al autorului
    broadcast(`user:${post.userId}`, 'notification', payload);
  }

  return Response.json(created, { status: 201 });

}
