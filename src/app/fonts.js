// app/fonts.ts
import { Manrope } from 'next/font/google'

export const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['300','400','500','600','700','800'],
  display: 'swap',
  variable: '--font-sans',
})
