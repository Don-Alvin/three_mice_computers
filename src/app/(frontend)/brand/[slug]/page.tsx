import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { ProductListing } from '@/components/ProductListing'
import { getBrandBySlug, getProductsByBrand } from '@/lib/catalogue'
import { parsePage, parseProductSort } from '@/lib/listing'

export const revalidate = 300

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)

  if (!brand) {
    return { title: 'Brand not found' }
  }

  return {
    title: brand.name,
    description: `Shop genuine ${brand.name} products in Kenya.`,
  }
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])

  const brand = await getBrandBySlug(slug)

  if (!brand) {
    notFound()
  }

  const sort = parseProductSort(query.sort)
  const page = parsePage(query.page)
  const list = await getProductsByBrand(slug, { sort, page })

  return (
    <div className="wrap py-8">
      <h1 className="mb-6 font-display text-3xl font-extrabold tracking-[-0.5px]">{brand.name}</h1>

      <ProductListing
        list={list}
        basePath={`/brand/${brand.slug}`}
        sort={sort}
        emptyMessage={`No ${brand.name} products yet.`}
      />
    </div>
  )
}
