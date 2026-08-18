import type { Metadata } from 'next'
import React from 'react'

import { NotFoundContent } from '@/components/NotFoundContent'
import { SITE_NAME } from '@/lib/site'

import { archivo, inter } from './(frontend)/fonts'
import './(frontend)/styles.css'

/**
 * Global 404: URLs that match no route at all.
 *
 * **Must be at the app root.** This is the only boundary that emits a real 404
 * status; from inside a route group the response stays 200. Verified both ways.
 *
 * Because it sits above every layout it has to supply its own `<html>`, fonts
 * and stylesheet, and it therefore renders without the header and footer. That
 * is Next's constraint, not a design choice — and it is why the *route-level*
 * boundary at `(frontend)/not-found.tsx` exists separately: `notFound()` calls
 * are the common case and deserve the full site chrome.
 *
 * Next 16 ships an `experimental.globalNotFound` flag with an
 * `app/global-not-found.tsx` convention for exactly this split. It is
 * deliberately NOT used: it is experimental, it would not change any observable
 * behaviour here, and the same separation is achieved above with stable APIs by
 * letting Next resolve the nearest boundary. Revisit if it stabilises.
 */
export const metadata: Metadata = {
  title: `Page not found | ${SITE_NAME}`,
  robots: { index: false, follow: true },
}

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <main className="flex flex-1 flex-col justify-center">
          <NotFoundContent />
        </main>
      </body>
    </html>
  )
}
