import type { Where } from 'payload'

import type { Brand, Category, Product } from '../payload-types'

import { getPayloadClient } from './payload'

/**
 * Typed read helpers for the storefront (plan §10, milestone 3).
 *
 * Every product query filters `published` explicitly. That is deliberate and
 * load-bearing: the local API defaults to `overrideAccess: true`, which bypasses
 * the collection's access control entirely — so relying on the
 * `publishedOrAuthenticated` filter here would silently publish draft products
 * to the storefront. The access control still guards the REST/GraphQL surface;
 * this is the equivalent guarantee for in-process reads.
 *
 * `depth: 1` throughout: enough to resolve a product's category, brand and
 * uploaded images for both cards and the detail page, without pulling a further
 * level of relationships nobody renders.
 */

const PUBLISHED: Where = { published: { equals: true } }

/** Page size for category, brand and search listings. */
export const PAGE_SIZE = 24

export type ProductSort = 'newest' | 'price-asc' | 'price-desc'

const SORT_CLAUSES: Record<ProductSort, string> = {
  newest: '-createdAt',
  'price-asc': 'price',
  'price-desc': '-price',
}

export type ProductListOptions = {
  sort?: ProductSort
  page?: number
  limit?: number
}

export type ProductList = {
  products: Product[]
  page: number
  totalPages: number
  totalProducts: number
}

const emptyList = (page = 1): ProductList => ({
  products: [],
  page,
  totalPages: 0,
  totalProducts: 0,
})

/** Shared listing query so sorting and pagination behave identically everywhere. */
const findProducts = async (where: Where, options: ProductListOptions = {}): Promise<ProductList> => {
  const { sort = 'newest', page = 1, limit = PAGE_SIZE } = options
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'products',
    where: { and: [PUBLISHED, where] },
    sort: SORT_CLAUSES[sort],
    limit,
    page,
    depth: 1,
  })

  return {
    products: result.docs,
    page: result.page ?? page,
    totalPages: result.totalPages,
    totalProducts: result.totalDocs,
  }
}

// ---------------------------------------------------------------- categories

/** All categories in display order. Drives the nav and the homepage grid. */
export const getCategories = async (): Promise<Category[]> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'categories',
    sort: 'order',
    limit: 100,
    depth: 1,
  })

  return result.docs
}

export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  return result.docs[0] ?? null
}

// -------------------------------------------------------------------- brands

/** All brands, alphabetical. Drives the brand strip and the brand menu. */
export const getBrands = async (): Promise<Brand[]> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'brands',
    sort: 'name',
    limit: 100,
    depth: 1,
  })

  return result.docs
}

export const getBrandBySlug = async (slug: string): Promise<Brand | null> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'brands',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  return result.docs[0] ?? null
}

// ------------------------------------------------------------------ products

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'products',
    where: { and: [PUBLISHED, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
  })

  return result.docs[0] ?? null
}

/** Homepage "Featured products". */
export const getFeaturedProducts = async (limit = 8): Promise<Product[]> => {
  const { products } = await findProducts({ featured: { equals: true } }, { limit })

  return products
}

/**
 * Homepage "Hot deals" — products with a compare-at price, i.e. genuinely
 * discounted (plan §8a). Tied to real data rather than a manual flag.
 */
export const getDealProducts = async (limit = 4): Promise<Product[]> => {
  const { products } = await findProducts({ compareAtPrice: { exists: true } }, { limit })

  return products
}

export const getProductsByCategory = async (
  categorySlug: string,
  options: ProductListOptions = {},
): Promise<ProductList> => {
  const category = await getCategoryBySlug(categorySlug)

  if (!category) {
    return emptyList(options.page)
  }

  return findProducts({ category: { equals: category.id } }, options)
}

export const getProductsByBrand = async (
  brandSlug: string,
  options: ProductListOptions = {},
): Promise<ProductList> => {
  const brand = await getBrandBySlug(brandSlug)

  if (!brand) {
    return emptyList(options.page)
  }

  return findProducts({ brand: { equals: brand.id } }, options)
}

/**
 * Search across product name and tags (plan §6).
 *
 * `description` is deliberately excluded even though plan §6 lists it. It is
 * Lexical JSON stored in a jsonb column, and Payload compiles both `like` and
 * `contains` on it straight to `ILIKE`, which Postgres cannot apply to jsonb:
 *
 *   Failed query: select count(*) from "products"
 *   where "products"."description" ilike $1
 *
 * Verified against the real database — it raises a database error rather than
 * returning nothing, so including it would break the search page outright.
 * Searching description needs a different mechanism (a generated plain-text
 * column maintained by a hook, or Postgres full-text search); flagged for the
 * milestone summary rather than silently dropped.
 */
export const searchProducts = async (
  query: string,
  options: ProductListOptions = {},
): Promise<ProductList> => {
  const term = query.trim()

  if (!term) {
    return emptyList(options.page)
  }

  return findProducts(
    {
      or: [{ name: { like: term } }, { tags: { like: term } }],
    },
    options,
  )
}
