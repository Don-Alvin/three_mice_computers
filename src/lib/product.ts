import type { Product } from '../payload-types'

/**
 * Read a product's slug as a plain string.
 *
 * `slug` is optional in `payload-types.ts` only because the field is no longer
 * marked `required` — Payload derives the TypeScript type straight from that
 * flag. It is NOT optional in the data: `slugField`'s `beforeValidate` hook
 * fills it from the name on every create and update, and the column is unique
 * and indexed. Dropping `required` was the fix for the admin refusing to submit
 * a blank slug (required is enforced in the browser, before the hook ever runs).
 *
 * Centralised so that reasoning lives in one place instead of a `?? ''` on every
 * link. The empty fallback is deliberately not a "safe" default: `/product/`
 * matches no route and 404s, so a broken invariant surfaces instead of quietly
 * pointing somewhere wrong.
 */
export const productSlug = (product: Pick<Product, 'slug'>): string => product.slug ?? ''
