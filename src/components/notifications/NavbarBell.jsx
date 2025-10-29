// components/notifications/NavbarBell.jsx
// ---------------------------------------
'use client'
import { useState } from 'react'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from './NotificationsProvider'
import NotificationsPanel from './NotificationsPanel'
import { useEffect, useRef } from 'react'

export default function NavbarBell() {
const { unread } = useNotifications() || { unread: 0 }
const [open, setOpen] = useState(false)

const ref = useRef(null)

useEffect(() => {
  if (!open) return
  function handleClick(e) {
    if (ref.current && !ref.current.contains(e.target)) {
      setOpen(false)
    }
  }
  document.addEventListener('mousedown', handleClick)
  document.addEventListener('touchstart', handleClick)
  return () => {
    document.removeEventListener('mousedown', handleClick)
    document.removeEventListener('touchstart', handleClick)
  }
}, [open])


return (
<div className="relative" ref={ref}>
<button
onClick={() => setOpen((o) => !o)}
className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/60"
aria-label="Notifications"
aria-expanded={open}
>
<Bell className="h-5 w-5" />
<AnimatePresence>
{unread > 0 && (
<motion.span
key="badge"
initial={{ scale: 0, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
exit={{ scale: 0, opacity: 0 }}
className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-pink-600 px-1.5 text-[10px] font-semibold text-white shadow"
>
{unread > 9 ? '9+' : unread}
</motion.span>
)}
</AnimatePresence>
{unread > 0 && (
<span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-pink-500/30 animate-pulse" />
)}
</button>


<AnimatePresence>
{open && (
<motion.div
  initial={{ opacity: 0, y: -6 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -6 }}
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
  className="fixed inset-x-2 top-16 z-50 w-auto overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96"
>
<NotificationsPanel onClose={() => setOpen(false)} />
</motion.div>
)}
</AnimatePresence>
</div>
)
}