"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import LogoPng from "./LogoPng";
import { UserNav } from "@/components/user/UserNav";
import { appSignOut } from "@/utils/logout";
import NavbarBell from "@/components/notifications/NavbarBell";

// Util mic pentru a uni clasele fără a aloca array-uri la fiecare randare
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AppNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const hideGlobalNav = pathname?.startsWith("/user");
  const [open, setOpen] = useState(false);
  const wasPointerDown = useRef(false);

  // Închide meniul la schimbarea rutei
  useEffect(() => setOpen(false), [pathname]);

  // Blochează scroll-ul în spate când meniul mobil e deschis
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  // Închidere la Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Elemente de meniu (memoizat ca să evităm re-randări inutile)
  const items = useMemo(
    () => [
      { name: "Home", href: "/" },
      { name: "Feed", href: "/feed" },
      { name: "Blog", href: "/blog" },
      { name: "Pricing", href: "/pricing" },
    ],
    []
  );

  if (hideGlobalNav) return null;

  const isActive = (href) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href + "/"));

  return (
    <div className="sticky top-0 z-50">
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-cyan-400/40 via-fuchsia-400/35 to-pink-400/30"
      />

      <nav
        aria-label="Primary"
        className={cx(
          "relative border-b border-secondary/60 bg-surface/90",
          // blur-ul poate produce lag pe device-uri slabe -> îl ținem doar pe md+
          "md:backdrop-blur supports-[backdrop-filter]:md:bg-surface/70"
        )}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-4 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
        >
          Skip to content
        </a>

        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 md:px-6">
          <LogoPng />

          {/* Desktop nav */}
          <ul className="hidden items-center gap-1 md:flex">
            {items.map(({ name, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={cx(
                    "inline-flex items-center rounded-full px-3 py-2 text-sm transition",
                    isActive(href)
                      ? "text-inverted border border-secondary/60 bg-card/70"
                      : "text-muted hover:text-inverted hover:bg-card/50 border border-transparent"
                  )}
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-center">
            {/* Notifications (mobile) */}
            {session?.user ? (
              <div className="mr-2 md:hidden">
                <NavbarBell />
              </div>
            ) : null}

            {/* Mobile toggle */}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-secondary/60 bg-card/60 text-inverted ring-accent transition active:scale-[0.98] md:hidden focus-visible:outline-none focus-visible:ring-2"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onPointerDown={() => (wasPointerDown.current = true)}
              onClick={() => {
                // evităm dublul toggle pe dispozitive care declanșează și pointerdown + click
                if (wasPointerDown.current) {
                  wasPointerDown.current = false;
                }
                setOpen((v) => !v);
              }}
            >
              <span className="sr-only">Toggle menu</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                {open ? (
                  <path
                    fill="currentColor"
                    d="M6 7.5h12v2H6zM6 14.5h12v2H6z"
                    transform="rotate(45 12 12)"
                  />
                ) : (
                  <path fill="currentColor" d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z" />
                )}
              </svg>
            </button>
          </div>

          {/* Actions (desktop) */}
          <div className="hidden items-center gap-3 md:flex">
            {session?.user ? (
              <>
                <NavbarBell />
                <UserNav />
                <button
                  onClick={() => appSignOut({ callbackUrl: "/" })}
                  className="rounded-full border border-secondary/60 bg-card/60 px-4 py-2 text-sm text-inverted transition hover:bg-card focus-visible:outline-none focus-visible:ring-2 ring-accent"
                >
                  Logout
                </button>
              </>
            ) : (
          <Link
            href="/auth/signin"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-inverted transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 ring-primary"
          >
            Login
          </Link>
            )}
          </div>
        </div>

        {/* Mobile sheet (optim cu grid-rows pentru animație fără calc de înălțime) */}
        <div
          id="mobile-menu"
          data-open={open}
          className={cx(
            "md:hidden border-t border-secondary/60",
            // container care își animă înălțimea fără a calcula pixel cu pixel
            "grid transition-[grid-template-rows,opacity] duration-300",
            open
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          )}
        >
          <div className="overflow-hidden">
            <div className="px-4 py-4">
              <ul className="flex flex-col gap-1">
                {items.map(({ name, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cx(
                        "block rounded-xl px-3 py-2 text-sm",
                        isActive(href)
                          ? "text-inverted border border-secondary/60 bg-card/70"
                          : "text-muted hover:text-inverted hover:bg-card/50 border border-transparent"
                      )}
                    >
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-3 h-px w-full bg-secondary/60" />

              {/* User pill + Logout (mobile) */}
              <div className="mt-3 flex min-w-0 items-center gap-3">
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
                      onClick={() => {
                        setOpen(false);
                        appSignOut({ callbackUrl: "/" });
                      }}
                      className="ml-auto rounded-full border border-secondary/60 bg-card/60 px-3 py-1.5 text-sm text-inverted transition hover:bg-card"
                      title="Logout"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setOpen(false);
                      signIn("google");
                    }}
                    className="w-full rounded-full bg-primary px-4 py-2 text-sm font-medium text-inverted transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 ring-primary"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
