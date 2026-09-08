import type { Metadata } from 'next'
import React from 'react'

import { CartDrawer } from '@/components/cart/CartDrawer'
import { MobileCartBar } from '@/components/cart/MobileCartBar'
import { Toast } from '@/components/cart/Toast'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { getBrands, getCategories } from '@/lib/catalogue'
import { groupCategories } from '@/lib/nav'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/site'

import { archivo, inter } from './fonts'
import './styles.css'

const baseUrl = (process.env.NEXT_PUBLIC_SERVER_URL ?? '').replace(/\/+$/, '')

export const metadata: Metadata = {
  // Without this, a relative `openGraph.images` URL resolves against whatever
  // host Next infers at build/preview time rather than the live domain, so a
  // shared link's preview image can silently point at a Vercel preview URL.
  // No live domain yet (§0 of the launch checklist) means this stays unset
  // rather than pointing at a placeholder that would need re-checking later.
  ...(baseUrl ? { metadataBase: new URL(baseUrl) } : {}),
  title: {
    // Read from the token rather than repeated as a literal: the header dropped
    // its visible tagline, so the title is now the only place it appears and a
    // second copy would be the one that goes stale.
    default: `${SITE_NAME} - ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_KE',
  },
  // 'summary', not 'summary_large_image': there is no 1200x630 OG share image
  // yet (launch checklist §0, asset still pending from the client). Per-page
  // `openGraph.images` (product pages) already override this default.
  twitter: {
    card: 'summary',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Nav and footer need the same reference data on every page. Both reads are
  // memoized behind the one Payload client and the pages are ISR-cached, so
  // this is not a per-request cost in practice.
  const [categories, brands] = await Promise.all([getCategories(), getBrands()])
  const groups = groupCategories(categories)

  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <SiteHeader groups={groups} brands={brands} />
        <main className="flex-1">{children}</main>
        <SiteFooter categories={categories} brands={brands} />
        {/* Mounted once here so all three are available from every page (§8a). */}
        <CartDrawer />
        <MobileCartBar />
        <Toast />
      </body>
    </html>
  )
}
