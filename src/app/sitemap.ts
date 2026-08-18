import type { MetadataRoute } from 'next'

import { getBrands, getCategories } from '@/lib/catalogue'
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

const SITEMAP_LIMIT = 5000

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SERVER_URL ?? '').replace(/\/+$/, '')

  // Without an absolute base URL a sitemap is meaningless — every entry would be
  // a relative path a crawler cannot resolve. Better to emit nothing.
  if (!baseUrl) {
    return []
  }

  const payload = await getPayloadClient()

  const [products, categories, brands] = await Promise.all([
    payload.find({
      collection: 'products',
      where: { published: { equals: true } },
      select: { slug: true, updatedAt: true },
      limit: SITEMAP_LIMIT,
      depth: 0,
      pagination: false,
    }),
    getCategories(),
    getBrands(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/deals`, changeFrequency: 'daily', priority: 0.8 },
  ]

  return [
    ...staticRoutes,
    ...categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...brands.map((brand) => ({
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
}
