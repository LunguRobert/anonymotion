// src/lib/realtime.js
// Channel-based SSE bus (works across the app)

const enc = new TextEncoder();

// Map<string, Set<ReadableStreamDefaultController>>
const channels = (globalThis.__sseChannels ||= new Map());

// Ensure channel exists
function getChannel(topic) {
  let set = channels.get(topic);
  if (!set) {
    set = new Set();
    channels.set(topic, set);
  }
  return set;
}

// Subscribe current controller to a topic
export function addSubscriber(controller, topic = 'feed') {
  getChannel(topic).add(controller);
}

// Unsubscribe from a topic
export function removeSubscriber(controller, topic = 'feed') {
  const set = channels.get(topic);
  if (!set) return;
  set.delete(controller);
  if (set.size === 0) channels.delete(topic);
}

// Broadcast to a topic
export function broadcast(topic, event, payload) {
  const set = channels.get(topic);
  if (!set || set.size === 0) return;
  const line = `event: ${event}\n` + `data: ${JSON.stringify(payload)}\n\n`;
  const chunk = enc.encode(line);
  for (const ctrl of set) {
    try { ctrl.enqueue(chunk); } catch { /* client closed */ }
  }
}
