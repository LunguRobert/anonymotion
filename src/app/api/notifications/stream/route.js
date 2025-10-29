export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { addSubscriber, removeSubscriber } from '@/lib/realtime';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const enc = new TextEncoder();
  const topic = `user:${session.user.id}`;
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(enc.encode('retry: 3000\n\n'));
      // heartbeat
      const ping = setInterval(() => controller.enqueue(enc.encode(':\n\n')), 15000);

      addSubscriber(controller, topic);
      cleanup = () => { clearInterval(ping); removeSubscriber(controller, topic); };

      req.signal.addEventListener('abort', cleanup, { once: true });
    },
    cancel() { cleanup(); }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    }
  });
}
