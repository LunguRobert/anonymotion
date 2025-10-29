// src/components/marketing/DemoFeedIsland.jsx
'use client'

import dynamic from 'next/dynamic'

// încărcăm DemoFeed doar în client, fără SSR
const DemoFeed = dynamic(() => import('./DemoFeed'), { ssr: false })

export default function DemoFeedIsland() {
  return <DemoFeed />
}
