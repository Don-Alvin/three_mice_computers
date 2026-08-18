import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { SearchForm } from '@/components/SearchForm'
import { SITE_NAME } from '@/lib/site'

import { archivo, inter } from './(frontend)/fonts'
import './(frontend)/styles.css'

/**
 * Storefront 404. Handles both unmatched URLs and the `notFound()` calls in the
 * product, category and brand routes.
 *
 * **This must live at the app root, not in the `(frontend)` group.** A nested
 * `not-found.tsx` renders fine but the response status stays **200** — a soft
 * 404 that search engines index as a real page. Only the root boundary emits a
 * true 404. Verified both ways: from the group, `/product/does-not-exist`
 * returned 200; from here it returns 404.
 *
 * The consequence of living at the root is that it cannot use the `(frontend)`
 * layout, so it carries its own `<html>`/`<body>`, fonts and stylesheet, and
 * goes without the header and footer. That is the trade Next forces; the page is
 * self-sufficient because it offers search and two ways onward.
 */
export const metadata: Metadata = {
  title: `Page not found | ${SITE_NAME}`,
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <main className="wrap flex flex-1 flex-col justify-center py-20 text-center">
          <p className="font-display text-[64px] leading-none font-extrabold text-red">404</p>

          <h1 className="mt-4 font-display text-2xl font-extrabold tracking-[-0.5px]">
            We couldn&apos;t find that page
          </h1>

          <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-text-muted">
            The link may be out of date, or the product may no longer be listed. Try a search, or
            browse the full catalogue.
          </p>

          <div className="mx-auto mt-7 w-full max-w-[520px]">
            <SearchForm />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="rounded-[10px] bg-ink px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red"
            >
              Browse all products
            </Link>
            <Link
              href="/"
              className="rounded-[10px] border border-line bg-surface px-4 py-2.5 text-sm font-bold text-charcoal transition-colors hover:border-red hover:text-red"
            >
              Go to homepage
            </Link>
          </div>
        </main>
      </body>
    </html>
  )
}
