import type { Product } from '../payload-types'

/**
 * Shared contract between `/api/verify-cart` and the cart client (plan §5.2).
 *
 * Deliberately framework-free — no `"use client"`, no React — so the route
 * handler and the browser store can both import it without dragging one
 * environment into the other.
 */

/**
 * `/api/verify-cart` rejects more than this many ids, so the cart refuses the
 * 51st distinct product. One constant, imported by both, so the guard and the
 * limit it protects can never drift apart.
 */
export const MAX_CART_LINES = 50

/** What the server vouches for. Quantities stay client-side; prices do not. */
export type VerifiedItem = {
  id: number
  name: string
  slug: string
  price: number
  stockStatus: Product['stockStatus']
}

export type VerifyCartResponse = { items: VerifiedItem[] }

/** Why a line disappeared during reconciliation. */
export type RemovalReason = 'unavailable' | 'out-of-stock'

/**
 * A product retitled in the admin since it went into the cart.
 *
 * Worth surfacing because a rename usually carries the meaning — "(Refurbished)",
 * "(Open Box)", a corrected capacity — so an order sent under the new title is
 * not the order the shopper thought they were placing.
 *
 * Note there is no equivalent for `slug`: taking the server's slug silently is
 * correct, since the old one would 404 the product link in the message.
 */
export type RenamedItem = { from: string; to: string }

export type ReconcileResult = {
  removed: { name: string; reason: RemovalReason }[]
  repriced: { name: string; from: number; to: number }[]
  renamed: RenamedItem[]
}
