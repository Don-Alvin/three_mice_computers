import type { Metadata } from 'next'
import React from 'react'

import { ProductListing } from '@/components/ProductListing'
import { SearchForm } from '@/components/SearchForm'
import { searchProducts } from '@/lib/catalogue'
import { parsePage, parseProductSort } from '@/lib/listing'

/** Search is dynamic, not ISR (plan §6). */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Search',
  // Search result pages are thin, duplicative and infinite — not what we want
  // crawlers spending budget on, even though the catalogue itself is open.
  robots: { index: false, follow: true },
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = await searchParams
  const term = typeof query.q === 'string' ? query.q : ''
  const sort = parseProductSort(query.sort)
  const page = parsePage(query.page)

  const list = await searchProducts(term, { sort, page })
  const basePath = `/search?q=${encodeURIComponent(term)}`

  return (
    <div className="wrap py-8">
      <h1 className="mb-4 font-display text-3xl font-extrabold tracking-[-0.5px]">
        {term ? <>Results for “{term}”</> : 'Search'}
      </h1>

      <SearchForm defaultValue={term} className="mb-8 max-w-[560px]" />

      {term ? (
        <ProductListing
          list={list}
          basePath={basePath}
          sort={sort}
          emptyMessage={`Nothing matched “${term}”. Try a shorter word, or browse the categories above.`}
        />
      ) : (
        <p className="text-sm text-text-muted">
          Type what you are looking for — a product name, or a keyword like “laptop” or “CCTV”.
        </p>
      )}
    </div>
  )
}
