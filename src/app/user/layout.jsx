'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import LogoPng from '@/components/LogoPng'
import { UserNav } from '@/components/user/UserNav'
import { appSignOut } from '@/utils/logout'
import NavbarBell from '@/components/notifications/NavbarBell'

const LINKS = [
  { href: '/user',         label: 'Home' },
  { href: '/user/journal', label: 'Journal' },
  { href: '/user/posts',   label: 'My Posts' },
  { href: '/user/stats',   label: 'Stats' },
  { href: '/feed',         label: 'Feed' },
]

export default function UserLayout({ children }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()

  // mark Home active only on exact '/user'
  const isActive = (href) => {
    if (href === '/user') return pathname === '/user'
    return pathname === href || pathname?.startsWith(href + '/')
  }


  // close mobile menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <div aria-hidden className="sticky top-0 z-[51] h-px w-full bg-gradient-to-r from-cyan-400/40 via-fuchsia-400/35 to-pink-400/30" />

      <nav
        aria-label="User"
        className="sticky top-px z-50 border-b border-secondary/60 bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/70"
      >
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-4 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
          Skip to content
        </a>

        <div className="mx-auto flex h-14 md:h-16 max-w-6xl items-center justify-between px-4">
          {/* Brand */}
          <LogoPng />

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {LINKS.map(({ href, label }) => {
              const active = isActive(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'inline-flex items-center rounded-full px-3 py-2 text-sm transition',
                      active
                        ? 'text-inverted border border-secondary/60 bg-card/70'
                        : 'text-muted hover:text-inverted hover:bg-card/50 border border-transparent',
                    ].join(' ')}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Desktop actions (right side) */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <>
                <NavbarBell /> {/* NEW */}
                <UserNav />
                <button
                  onClick={() => appSignOut({ callbackUrl: '/' })}
                  className="ml-1 rounded-full border border-secondary/60 bg-card/60 px-4 py-2 text-sm text-inverted transition hover:bg-card focus-visible:outline-none focus-visible:ring-2 ring-accent"
                  aria-label="Logout"
                  title="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <UserNav />
            )}
          </div>

          <div className='flex justify-center items-center'>
            {/* Notifications (mobile) */}
            {session?.user ? (
              <div className="md:hidden mr-2">
                <NavbarBell /> {/* NEW */}
              </div>
            ) : null}

            {/* Mobile toggle */}
            <button
              type="button"
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-secondary/60 bg-card/60 text-inverted focus-visible:outline-none focus-visible:ring-2 ring-accent"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(v => !v)}
            >
              <span className="sr-only">Toggle menu</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                {open ? (
                  <path fill="currentColor" d="M6 6h12v2H6zM6 16h12v2H6zM6 11h12v2H6z" transform="rotate(45 12 12)"/>
                ) : (
                  <path fill="currentColor" d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z"/>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile sheet (slides down) */}
        <div
          id="mobile-menu"
          data-open={open ? 'true' : 'false'}
          className="md:hidden overflow-hidden border-t border-secondary/60 transition-[max-height,opacity] duration-300"
          style={{ maxHeight: open ? '320px' : '0px', opacity: open ? 1 : 0 }}
        >
          <div className="px-4 py-4">
            <ul className="flex flex-col gap-1">
              {LINKS.map(({ href, label }) => {
                const active = isActive(href)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={[
                        'block rounded-xl px-3 py-2 text-sm',
                        active
                          ? 'text-inverted border border-secondary/60 bg-card/70'
                          : 'text-muted hover:text-inverted hover:bg-card/50 border border-transparent',
                      ].join(' ')}
                    >
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="mt-3 h-px w-full bg-secondary/60" />

            {/* Mobile actions: right-aligned Logout */}
            <div className="mt-3 flex items-center">
              <UserNav />
              {session?.user && (
                <button
                  onClick={() => appSignOut({ callbackUrl: '/' })}
                  className="ml-auto rounded-full border border-secondary/60 bg-card/60 px-4 py-2 text-sm text-inverted transition hover:bg-card"
                  aria-label="Logout"
                  title="Logout"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main id="main" className="flex-1 w-full max-w-6xl mx-auto px-4 py-10">
        {children}
      </main>
    </div>
  )
}
