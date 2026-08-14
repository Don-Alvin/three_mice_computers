import type { Metadata } from 'next'
import React from 'react'

import { ProductListing } from '@/components/ProductListing'
import { getAllProducts } from '@/lib/catalogue'
import { parsePage, parseProductSort } from '@/lib/listing'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'All products',
  description: 'Every computer, CCTV, networking and accessory product we stock.',
}

/** Next 16: searchParams is a Promise and must be awaited. */
type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * `/products` — the whole catalogue, paginated (plan §6). Destination of the
 * homepage "View all →" link on Featured products (§8a.1).
 *
 * Deliberately the same shell as the category and brand listings: one shared
 * pattern across every listing page, per §8a.2.
 */
export default async function ProductsPage({ searchParams }: PageProps) {
  const query = await searchParams

  const sort = parseProductSort(query.sort)
  const page = parsePage(query.page)
  const list = await getAllProducts({ sort, page })

  return (
    <div className="wrap py-8">
      <h1 className="mb-2 font-display text-3xl font-extrabold tracking-[-0.5px]">All products</h1>
      <p className="mb-6 max-w-[60ch] text-sm text-text-muted">
        Everything we stock, newest first. Use the category menu to narrow it down.
      </p>

      <ProductListing
        list={list}
        basePath="/products"
        sort={sort}
        emptyMessage="No products yet."
      />
    </div>
  )
}
