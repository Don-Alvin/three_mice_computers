import Link from 'next/link'
import React from 'react'

import { SearchForm } from './SearchForm'

/**
 * The 404 body, shared by both not-found boundaries so they cannot drift.
 *
 * Two boundaries exist because Next resolves the *nearest* one and they differ
 * in what they can do:
 *
 * - `app/(frontend)/not-found.tsx` catches the `notFound()` calls in the
 *   product, category and brand routes. It renders inside the storefront layout,
 *   so the shopper keeps the header, nav, search and footer — which is the whole
 *   point when a product link has gone stale.
 * - `app/not-found.tsx` catches URLs that match no route at all. It sits above
 *   every layout, so it must supply its own `<html>`/`<body>`, and it is the only
 *   one of the two that emits a real 404 status.
 *
 * Offers a way onward rather than a dead end: an unknown product slug usually
 * means a renamed or retired item, and search is the fastest route to whatever
 * replaced it.
 */
export const NotFoundContent = () => (
  <div className="wrap py-20 text-center">
    <p className="font-display text-[64px] leading-none font-extrabold text-red">404</p>

    <h1 className="mt-4 font-display text-2xl font-extrabold tracking-[-0.5px]">
      We couldn&apos;t find that page
    </h1>

    <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-text-muted">
      The link may be out of date, or the product may no longer be listed. Try a search, or browse
      the full catalogue.
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
  </div>
)
