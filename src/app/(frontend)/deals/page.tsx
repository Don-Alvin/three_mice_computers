import type { Metadata } from 'next'
import React from 'react'

import { ProductListing } from '@/components/ProductListing'
import { getDeals } from '@/lib/catalogue'
import { parsePage, parseProductSort } from '@/lib/listing'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Hot deals',
  description: 'Discounted computers, CCTV, networking and accessories.',
}

/** Next 16: searchParams is a Promise and must be awaited. */
type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * `/deals` — every discounted product, i.e. the full version of the homepage
 * "Hot deals" teaser rather than its four-item slice (plan §6, §8a.1).
 *
 * "Newest first" is the default sort, but the shared listing's sort links stay
 * available so this page behaves like every other listing (§8a.2). Pagination
 * only appears once there are more than PAGE_SIZE discounted products.
 */
export default async function DealsPage({ searchParams }: PageProps) {
  const query = await searchParams

  const sort = parseProductSort(query.sort)
  const page = parsePage(query.page)
  const list = await getDeals({ sort, page })

  return (
    <div className="wrap py-8">
      <h1 className="mb-2 font-display text-3xl font-extrabold tracking-[-0.5px]">Hot deals</h1>
      <p className="mb-6 max-w-[60ch] text-sm text-text-muted">
        Everything currently discounted from its usual price.
      </p>

      <ProductListing
        list={list}
        basePath="/deals"
        sort={sort}
        emptyMessage="No deals running right now — check back soon."
      />
    </div>
  )
}
