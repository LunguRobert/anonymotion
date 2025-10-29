// components/notifications/NotificationsProvider.jsx
// --------------------------------------------------
'use client'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'


const NotifCtx = createContext(null)


export function NotificationsProvider({ children }) {
const { status } = useSession() // 'authenticated' | 'unauthenticated' | 'loading'
const [items, setItems] = useState([])
const [unread, setUnread] = useState(0)
const esRef = useRef(null)
const chanRef = useRef(null)


// Sync multiple tabs
useEffect(() => {
chanRef.current = new BroadcastChannel('notif')
chanRef.current.onmessage = (ev) => {
if (ev?.data?.type === 'push') {
setItems((prev) => [ev.data.payload, ...prev].slice(0, 20))
setUnread((n) => n + 1)
}
if (ev?.data?.type === 'markAllRead') setUnread(0)
if (ev?.data?.type === 'clear') { setItems([]); setUnread(0) }
}
return () => chanRef.current?.close()
}, [])


// Start SSE when logged in
useEffect(() => {
if (status !== 'authenticated') {
if (esRef.current) { try { esRef.current.close() } catch {} esRef.current = null }
setItems([]); setUnread(0)
return
}
if (esRef.current) return
const es = new EventSource('/api/notifications/stream')
es.addEventListener('notification', (e) => {
try {
const payload = JSON.parse(e.data)
setItems((prev) => [payload, ...prev].slice(0, 20))
setUnread((n) => n + 1)
chanRef.current?.postMessage({ type: 'push', payload })
} catch {}
})
es.onerror = () => {
try { es.close() } catch {}
esRef.current = null
setTimeout(() => {
if (status === 'authenticated' && !esRef.current) {
esRef.current = new EventSource('/api/notifications/stream')
}
}, 3000)
}
esRef.current = es
return () => { try { es.close() } catch {}; esRef.current = null }
}, [status])


const api = useMemo(() => ({
items,
unread,
markAllRead: () => { setUnread(0); chanRef.current?.postMessage({ type: 'markAllRead' }) },
clear: () => { setItems([]); setUnread(0); chanRef.current?.postMessage({ type: 'clear' }) },
}), [items, unread])


return <NotifCtx.Provider value={api}>{children}</NotifCtx.Provider>
}


export function useNotifications() { return useContext(NotifCtx) }