export function assertSameOrigin(req) {
// Doar metode mutative au nevoie de verificare strictă
const m = req.method?.toUpperCase?.() || ''
if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return null


const origin = req.headers.get('origin') || ''
const host = req.headers.get('host') || ''
const base = process.env.NEXT_PUBLIC_BASE_URL || ''
const allowedHost = base.replace(/^https?:\/\//, '').replace(/\/$/, '')


try {
const u = new URL(origin)
const same = (u.host && (u.host === allowedHost || u.host === host))
if (same) return null
} catch {}


return new Response(JSON.stringify({ error: 'Forbidden (origin)' }), {
status: 403,
headers: { 'content-type': 'application/json' },
})
}