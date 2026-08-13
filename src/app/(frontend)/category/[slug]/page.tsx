import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { ProductListing } from '@/components/ProductListing'
import { getCategoryBySlug, getProductsByCategory } from '@/lib/catalogue'
import { parsePage, parseProductSort } from '@/lib/listing'

export const revalidate = 300

/** Next 16: params and searchParams are Promises and must be awaited. */
type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return { title: 'Category not found' }
  }

  return {
    title: category.seoTitle || category.name,
    description: category.seoDescription || `Shop ${category.name} in Kenya.`,
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])

  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const sort = parseProductSort(query.sort)
  const page = parsePage(query.page)
  const list = await getProductsByCategory(slug, { sort, page })

  return (
    <div className="wrap py-8">
      <h1 className="mb-2 font-display text-3xl font-extrabold tracking-[-0.5px]">
        {category.name}
      </h1>
      {category.seoDescription ? (
        <p className="mb-6 max-w-[60ch] text-sm text-text-muted">{category.seoDescription}</p>
      ) : (
        <div className="mb-6" />
      )}

      <ProductListing
        list={list}
        basePath={`/category/${category.slug}`}
        sort={sort}
        emptyMessage={`No products in ${category.name} yet.`}
      />
    </div>
  )
}
