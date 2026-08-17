import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { MAX_CART_LINES, type VerifiedItem } from '@/lib/verify-cart'

/**
 * `POST /api/verify-cart` — price and stock authority (plan §5.2).
 *
 * The cart lives in localStorage, so every price in it is either stale or
 * whatever a visitor typed into devtools. This route is the only thing the
 * WhatsApp message is allowed to be built from (§14): the client sends ids and
 * gets back current names, slugs, prices and stock, then reconciles.
 *
 * Note this is a **read** of public catalogue data. There is nothing to
 * authenticate and nothing to rate limit (§5.4 forbids adding either) — the
 * same rows are already served by the storefront pages.
 *
 * The `published` filter is load-bearing: `getPayloadClient()` is the local API,
 * which bypasses collection access control, so the published-read rule that
 * protects `/api/products` does NOT apply here. Without this line an unpublished
 * product could be priced and ordered.
 */
const invalid = () => NextResponse.json({ error: 'Invalid request' }, { status: 400 })

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return invalid()
  }

  const productIds = (body as { productIds?: unknown } | null)?.productIds

  if (!Array.isArray(productIds) || productIds.length === 0 || productIds.length > MAX_CART_LINES) {
    return invalid()
  }

  // Ids are Postgres serials (§14: numbers, never coerced to string). Rejecting
  // anything else keeps hand-crafted payloads out of the query builder.
  if (
    !productIds.every(
      (id) => typeof id === 'number' && Number.isInteger(id) && id > 0 && Number.isSafeInteger(id),
    )
  ) {
    return invalid()
  }

  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'products',
    where: { id: { in: Array.from(new Set(productIds)) }, published: { equals: true } },
    limit: MAX_CART_LINES,
    depth: 0,
    select: { id: true, name: true, slug: true, price: true, stockStatus: true },
    pagination: false,
  })

  // Anything the client asked about that is missing here — deleted, unpublished,
  // or never existed — is simply absent from the response, and the client drops
  // that line. No need to say which; it cannot be ordered either way.
  const items: VerifiedItem[] = result.docs.map((doc) => ({
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    price: doc.price,
    stockStatus: doc.stockStatus,
  }))

  return NextResponse.json({ items } satisfies { items: VerifiedItem[] })
}
