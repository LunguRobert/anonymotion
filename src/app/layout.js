// app/layout.js
import './globals.css'
import { Suspense } from 'react'
import { Manrope } from 'next/font/google'
import Script from 'next/script'
import AppNavbar from '@/components/Navbar'
import AppFooter from '@/components/Footer'
import SessionWrapper from '@/components/SessionWrapper'
import { NotificationsProvider } from '@/components/notifications/NotificationsProvider'
import CookieConsent from '@/components/CookieConsent'
import GaReporter from '@/components/GaReporter'

// ✅ Tailwind via className
const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['300','400','500','600','700','800'],
  display: 'swap',
})

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''

export const metadata = {
  title: {
    default: 'Anonymotion',
    template: '%s | Anonymotion',
  },
  description: 'A calm and safe space to express your emotions anonymously and connect with others.',
  openGraph: {
    title: 'Anonymotion',
    description: 'Express emotions anonymously.',
    url: 'https://anonymotions.com',
    siteName: 'Anonymotion',
    images: [
      {
        url: 'https://anonymotions.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Anonymotion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anonymotion',
    description: 'Express emotions anonymously.',
    images: ['https://anonymotions.com/og-image.png'],
  },
  metadataBase: new URL('https://anonymotions.com'),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || 'https://anonymotions.com',
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#0b0f14' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Performance: warm up GA domain */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Consent Mode v2 bootstrap — default DENIED, se actualizează după Accept */}
        <Script id="consent-bootstrap" strategy="beforeInteractive">
          {`
            (function() {
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              var c = null;
              try { c = localStorage.getItem('cookie-consent'); } catch(e) {}
              var granted = c === 'granted';
              gtag('consent', 'default', {
                ad_storage: granted ? 'granted' : 'denied',
                analytics_storage: granted ? 'granted' : 'denied',
                ad_user_data: granted ? 'granted' : 'denied',
                ad_personalization: granted ? 'granted' : 'denied',
                wait_for_update: 500
              });
            })();
          `}
        </Script>

        {/* GA4 loader & init – non-blocking */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: false });
              `}
            </Script>
          </>
        )}
      </head>

      <body className={`${manrope.className} bg-background text-text antialiased`}>
        <SessionWrapper>
          <NotificationsProvider>
            <AppNavbar />
            {children}
            <AppFooter />
          </NotificationsProvider>
        </SessionWrapper>

        {/* IMPORTANT: hook-urile de navigare trebuie montate într-un Suspense */}
        <Suspense fallback={null}>
          <GaReporter gaId={GA_ID} />
        </Suspense>
        <Suspense fallback={null}>
          <CookieConsent />
        </Suspense>
      </body>
    </html>
  )
}
