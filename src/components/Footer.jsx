'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AppFooter() {

  const pathname = usePathname()
  if (pathname.startsWith('/user')) return null
  if (pathname.startsWith('/feed')) return null

  return (
    <footer className="w-full border-t border-muted bg-surface text-muted py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo */}
        <span className="text-sm font-semibold text-text">
          anonymotions<span className="text-primary">.</span>
        </span>

        {/* Links */}
        <div className="flex gap-6 text-sm">
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link href="/contact" className="hover:text-primary transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
