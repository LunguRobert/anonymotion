'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'
import LogoPng from './LogoPng'
import { UserNav } from '@/components/user/UserNav'
import { appSignOut } from '@/utils/logout'
import NavbarBell from '@/components/notifications/NavbarBell'

export default function AppNavbar() {
  const pathname = usePathname()
  const hideGlobalNav = pathname?.startsWith('/user')

  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  // close mobile menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  const items = useMemo(() => ([
    { name: 'Home',    href: '/' },
    { name: 'Feed',    href: '/feed' },
    { name: 'Blog',    href: '/blog' },
    { name: 'Pricing', href: '/pricing' },
  ]), [])

  if (hideGlobalNav) return null

  const firstName = session?.user?.name?.split(' ')?.[0] || 'User'

  return (
    <div className="sticky top-0 z-50">
      <div aria-hidden className="h-px w-full bg-gradient-to-r from-cyan-400/40 via-fuchsia-400/35 to-pink-400/30" />

      <nav
        aria-label="Primary"
        className="relative border-b border-secondary/60 bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/70"
      >
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-4 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
          Skip to content
        </a>

        <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <LogoPng />

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {items.map(({ name, href }) => {
              const active =
                pathname === href || (href !== '/' && pathname?.startsWith(href + '/'))
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
                    {name}
                  </Link>
                </li>
              )
            })}
          </ul>

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
                  <path fill="currentColor" d="M6 6h12v2H6zM6 16h12v2H6zM6 11h12v2H6z" transform="rotate(45 12 12)" />
                ) : (
                  <path fill="currentColor" d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z" />
                )}
              </svg>
            </button>
          </div>

          {/* Actions (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <>
                {/* notificări (desktop) */}
                <NavbarBell /> {/* NEW */}

                {/* user pill cu bulina verde, click -> /user */}
                <UserNav />

                {/* buton logout în dreapta */}
                <button
                  onClick={() => appSignOut({ callbackUrl: '/' })}
                  className="rounded-full border border-secondary/60 bg-card/60 px-4 py-2 text-sm text-inverted transition hover:bg-card focus-visible:outline-none focus-visible:ring-2 ring-accent"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-inverted transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 ring-primary"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile sheet (drops from top, not full-screen) */}
        <div
          id="mobile-menu"
          data-open={open ? 'true' : 'false'}
          className="md:hidden overflow-hidden border-t border-secondary/60 transition-[max-height,opacity] duration-300"
          style={{ maxHeight: open ? '320px' : '0px', opacity: open ? 1 : 0 }}
        >
          <div className="px-4 py-4">
            <ul className="flex flex-col gap-1">
              {items.map(({ name, href }) => {
                const active =
                  pathname === href || (href !== '/' && pathname?.startsWith(href + '/'))
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={[
                        'block rounded-xl px-3 py-2 text-sm',
                        active
                          ? 'text-inverted border border-secondary/60 bg-card/70'
                          : 'text-muted hover:text-inverted hover:bg-card/50 border border-transparent',
                      ].join(' ')}
                    >
                      {name}
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="mt-3 h-px w-full bg-secondary/60" />

            {/* User pill + Logout (mobile) */}
            <div className="mt-3 flex items-center gap-3 min-w-0">
              {session?.user ? (
                <>
                  <div
                    onClick={() => setOpen(false)}
                    className="min-w-0"
                    aria-label="Open dashboard"
                  >
                    <UserNav className="w-full cursor-pointer" />
                  </div>

                  <button
                    onClick={() => { setOpen(false); appSignOut({ callbackUrl: '/' }) }}
                    className="ml-auto rounded-full border border-secondary/60 bg-card/60 px-3 py-1.5 text-sm text-inverted transition hover:bg-card"
                    title="Logout"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setOpen(false); signIn('google') }}
                  className="w-full rounded-full bg-primary px-4 py-2 text-sm font-medium text-inverted transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 ring-primary"
                >
                  Login
                </button>
              )}
            </div>

          </div>
        </div>
      </nav>
    </div>
  )
}
