import type { Metadata } from 'next'
import React from 'react'

import { CartDrawer } from '@/components/cart/CartDrawer'
import { MobileCartBar } from '@/components/cart/MobileCartBar'
import { Toast } from '@/components/cart/Toast'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { getBrands, getCategories } from '@/lib/catalogue'
import { groupCategories } from '@/lib/nav'
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site'

import { archivo, inter } from './fonts'
import './styles.css'

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Computers & Electronics in Kenya`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
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
