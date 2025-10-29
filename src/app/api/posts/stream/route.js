export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { addSubscriber, removeSubscriber } from '@/lib/realtime';

export async function GET(req) {
  const enc = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(enc.encode('retry: 5000\n\n'));
      const ping = setInterval(() => controller.enqueue(enc.encode(':\n\n')), 15000);

      addSubscriber(controller, 'feed');
      cleanup = () => { clearInterval(ping); removeSubscriber(controller, 'feed'); };
      // închide când clientul pleacă
      req.signal.addEventListener('abort', cleanup, { once: true });
    },
    cancel() { cleanup(); }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    }
  });
}
