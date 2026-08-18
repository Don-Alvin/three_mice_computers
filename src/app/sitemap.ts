import type { MetadataRoute } from 'next'

import { getPayloadClient } from '@/lib/payload'

/**
 * Sitemap generated from the database (plan §9).
 *
 * Products are read here rather than through `getAllProducts` because the
 * listing helper paginates at PAGE_SIZE and returns fully populated docs; a
 * sitemap wants every row and only two fields from each.
 *
 * `published: { equals: true }` for the same reason as everywhere else: the
 * local API bypasses access control, and an unpublished product must not be
 * advertised to crawlers (§5.2).
 */
export const revalidate = 3600

/**
 * The sitemap protocol's own ceiling: 50,000 URLs per file. Exceeding it is the
 * only condition that would require splitting into a sitemap index, and this
 * shop is sized at roughly 500 products (§5.4) — two orders of magnitude away.
 *
 * It is used as the query limit rather than an arbitrary smaller number, and a
 * run that actually reaches it logs a warning: the failure mode being guarded
 * against is not "too many URLs", it is **silently dropping public routes** with
 * nobody noticing. If this warning ever fires, that is the moment to add
 * `generateSitemaps` and emit an index — not before.
 */
const SITEMAP_URL_LIMIT = 50_000

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SERVER_URL ?? '').replace(/\/+$/, '')

  // Without an absolute base URL a sitemap is meaningless — every entry would be
  // a relative path a crawler cannot resolve. Better to emit nothing.
  if (!baseUrl) {
    return []
  }

  const payload = await getPayloadClient()

  /**
   * All three read directly with `pagination: false` rather than through the
   * nav helpers: `getCategories`/`getBrands` cap at 100 because that is a sane
   * ceiling for a *menu*, and inheriting a UI limit here would quietly omit
   * public URLs once the catalogue outgrew it.
   */
  const [products, categories, brands] = await Promise.all([
    payload.find({
      collection: 'products',
      where: { published: { equals: true } },
      select: { slug: true, updatedAt: true },
      limit: SITEMAP_URL_LIMIT,
      depth: 0,
      pagination: false,
    }),
    payload.find({
      collection: 'categories',
      select: { slug: true },
      limit: SITEMAP_URL_LIMIT,
      depth: 0,
      pagination: false,
    }),
    payload.find({
      collection: 'brands',
      select: { slug: true },
      limit: SITEMAP_URL_LIMIT,
      depth: 0,
      pagination: false,
    }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/deals`, changeFrequency: 'daily', priority: 0.8 },
  ]

  const entries: MetadataRoute.Sitemap = [
    ...staticRoutes,
    ...categories.docs.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...brands.docs.map((brand) => ({
      url: `${baseUrl}/brand/${brand.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...products.docs.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]

  /**
   * The 50,000 budget applies to the **file**, not to each query. Capping the
   * three reads individually still allowed the combined total to overflow and
   * emit a sitemap the protocol rejects, so the cut is made here, once, over
   * everything.
   *
   * Static routes come first in the array and products last, so if this ever
   * bites, the pages that matter most survive and the tail is what goes.
   */
  if (entries.length > SITEMAP_URL_LIMIT) {
    payload.logger.warn(
      `Sitemap has ${entries.length} URLs, over the ${SITEMAP_URL_LIMIT} protocol limit — truncating, so ${entries.length - SITEMAP_URL_LIMIT} public routes are NOT being advertised. Split into a sitemap index with generateSitemaps.`,
    )

    return entries.slice(0, SITEMAP_URL_LIMIT)
  }

  return entries
}
