// app/layout.js
import './globals.css'
import { Manrope } from 'next/font/google'
import AppNavbar from '@/components/Navbar'
import AppFooter from '@/components/Footer'
import SessionWrapper from '@/components/SessionWrapper'
import { NotificationsProvider } from '@/components/notifications/NotificationsProvider'

// ✅ Folosim className, nu variabile Tailwind (nu e nevoie de tailwind.config)
const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['300','400','500','600','700','800'],
  display: 'swap',
})

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
      {/* 👇 Aplicăm Manrope pe tot body-ul prin className */}
      <body className={`${manrope.className} bg-background text-text antialiased`}>
        <SessionWrapper>
          <NotificationsProvider>
            <AppNavbar />
            {children}
            <AppFooter />
          </NotificationsProvider>
        </SessionWrapper>
      </body>
    </html>
  )
}
