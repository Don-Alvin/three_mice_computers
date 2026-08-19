import type { Product } from '../payload-types'

import { resolveImage, type ResolvedImage } from './media'

/**
 * Source for the homepage hero carousel (plan §8a.0.5).
 *
 * The plan confirms "random" means a rotating server-side selection that
 * changes on each ISR revalidation, NOT per-visitor randomness, and rules out
 * shuffling client side after hydration. That constraint is what shapes this
 * module: the homepage is cached for `revalidate` seconds, so a per-request
 * shuffle would either be baked into the cached HTML anyway (making it a lie)
 * or force dynamic rendering and throw away the ISR §6 depends on.
 *
 * The rotation is therefore derived from the revalidation window rather than
 * from `Math.random()`. Two properties matter and random sampling has neither:
 * it is deterministic, so a regeneration part-way through a window yields the
 * same slides rather than reshuffling under a shopper mid-visit; and it is
 * guaranteed to actually move to a different window's selection each time,
 * where random can repeat itself.
 */

/** Slides in one rotation. Small enough that a shopper can reach the end. */
export const HERO_SLIDE_COUNT = 5

/**
 * How many featured products to read so the rotation has something to rotate
 * through. Above `HERO_SLIDE_COUNT`, or every window shows the same slides.
 */
export const HERO_POOL_SIZE = 15

/** The serialisable slice of a product the client carousel actually renders. */
export type HeroSlide = {
  id: number
  slug: string
  name: string
  price: number
  compareAtPrice: number | null
  categoryName: string | null
  image: ResolvedImage | null
}

/**
 * Which revalidation window we are in. Advances by exactly 1 every
 * `revalidateSeconds`, which is what makes the selection move in step with ISR.
 */
export const rotationIndex = (revalidateSeconds: number, now: number = Date.now()): number =>
  Math.floor(now / (revalidateSeconds * 1000))

/**
 * A window of `count` products starting at the rotation offset, wrapping around
 * the end of the pool. A catalogue smaller than the window is returned whole
 * rather than padded with repeats, so a shop with three featured products gets
 * three slides, not the same product three times.
 */
export const pickHeroProducts = (
  products: Product[],
  count: number,
  rotation: number,
): Product[] => {
  if (products.length <= count) {
    return products
  }

  const start = ((rotation % products.length) + products.length) % products.length

  return Array.from({ length: count }, (_, offset) => products[(start + offset) % products.length])
}

export const toHeroSlide = (product: Product): HeroSlide => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  price: product.price,
  compareAtPrice: product.compareAtPrice ?? null,
  categoryName: typeof product.category === 'object' ? product.category.name : null,
  // `full` rather than the card size: the hero tile renders several times the
  // width of a grid thumbnail, so the card render would visibly soften.
  image: resolveImage(product.images?.[0]?.image, 'full'),
})
