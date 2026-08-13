import { Archivo, Inter } from 'next/font/google'

/**
 * Archivo (display) + Inter (body), as prototyped (plan §8).
 *
 * `next/font/google` downloads these at build time and serves them from our own
 * origin — no request to fonts.googleapis.com at runtime, which matters because
 * the §5.1 CSP is `default-src 'self'` and would block a third-party stylesheet.
 */
export const archivo = Archivo({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})
