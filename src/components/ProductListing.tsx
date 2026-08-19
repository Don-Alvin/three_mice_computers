import Link from 'next/link'
import React from 'react'

import type { ProductList, ProductSort } from '../lib/catalogue'

import { SORT_OPTIONS } from '../lib/listing'
import { ProductCard } from './ProductCard'

/**
 * Shared grid for the category, brand and search listings.
 *
 * Sorting and pagination are plain links rather than a select with an onChange
 * handler, so the whole listing stays a server component and keeps working
 * without JavaScript.
 */
export const ProductListing = ({
  list,
  basePath,
  baseParams,
  sort,
  emptyMessage = 'No products here yet.',
}: {
  list: ProductList
  /** Path only. Anything after a `?` belongs in `baseParams`. */
  basePath: string
  /**
   * Query the listing must carry on every sort and page link, e.g. the search
   * term. It exists because `basePath` used to be allowed to carry its own
   * query string: `/search?q=dell` then had `?sort=price-asc` appended to it,
   * producing `/search?q=dell?sort=price-asc`, and the whole tail was read back
   * as the search term ("Nothing matched dell?sort=price-asc"). Sorting and
   * pagination were both dead on /search as a result. Building one
   * URLSearchParams from both sources removes the join, and the escaping, from
   * the caller's hands.
   */
  baseParams?: Record<string, string>
  sort: ProductSort
  emptyMessage?: string
}) => {
  const href = (params: { sort?: ProductSort; page?: number }) => {
    const search = new URLSearchParams(baseParams)

    const nextSort = params.sort ?? sort
    if (nextSort !== 'newest') {
      search.set('sort', nextSort)
    }

    if (params.page && params.page > 1) {
      search.set('page', String(params.page))
    }

    const query = search.toString()

    return query ? `${basePath}?${query}` : basePath
  }

  if (list.totalProducts === 0) {
    return <p className="py-10 text-sm text-text-muted">{emptyMessage}</p>
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          {list.totalProducts} {list.totalProducts === 1 ? 'product' : 'products'}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm text-text-muted">Sort:</span>
          {SORT_OPTIONS.map((option) => {
            const active = option.value === sort

            return (
              <Link
                key={option.value}
                href={href({ sort: option.value, page: 1 })}
                aria-current={active ? 'true' : undefined}
                className={`rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                  active
                    ? 'border-red bg-red text-white'
                    : 'border-line bg-surface text-charcoal hover:border-red hover:text-red'
                }`}
              >
                {option.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 min-[720px]:grid-cols-3 lg:grid-cols-4">
        {list.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {list.totalPages > 1 ? (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
          {list.page > 1 ? (
            <Link
              href={href({ page: list.page - 1 })}
              className="rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-semibold hover:border-red hover:text-red"
            >
              ← Previous
            </Link>
          ) : null}

          <span className="px-2 text-sm text-text-muted">
            Page {list.page} of {list.totalPages}
          </span>

          {list.page < list.totalPages ? (
            <Link
              href={href({ page: list.page + 1 })}
              className="rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-semibold hover:border-red hover:text-red"
            >
              Next →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  )
}
