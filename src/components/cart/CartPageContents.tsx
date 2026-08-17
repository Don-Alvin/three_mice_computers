'use client'

import Link from 'next/link'
import React from 'react'

import { selectTotalItems, selectTotalKES, useCart, useCartHydrated } from '@/lib/cart'
import { formatKES } from '@/lib/format'
import { CartLine } from './CartLine'
import { CheckoutAction } from './CheckoutAction'
import { EmptyCart } from './EmptyCart'

/**
 * Body of `/cart` — the full page where checkout happens (plan §6/§7).
 *
 * The page has no prototype reference (the prototype only draws the drawer), so
 * it reuses the drawer's own pieces at a larger size: same lines, same totals,
 * two columns instead of one. §8a.2's rule for unreferenced pages — one shared
 * pattern rather than a new invention per page.
 *
 * Optional name and delivery-location inputs are M6 (plan §7 step 1); they exist
 * only to be typed into the WhatsApp message and are never stored server-side.
 */
export const CartPageContents = () => {
  const items = useCart((state) => state.items)
  const clear = useCart((state) => state.clear)
  const totalItems = useCart(selectTotalItems)
  const totalKES = useCart(selectTotalKES)
  const hydrated = useCartHydrated()

  // The server cannot read localStorage, so the first client render must agree
  // with it and the real contents appear immediately after.
  if (!hydrated) {
    return <div className="min-h-[40vh]" aria-busy="true" />
  }

  if (items.length === 0) {
    return <EmptyCart variant="page" />
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.7fr_1fr]">
      <div className="rounded-2xl border border-line bg-surface px-5 py-1">
        <ul>
          {items.map((line) => (
            <CartLine key={line.id} line={line} variant="page" />
          ))}
        </ul>
      </div>

      <aside className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-4 font-display text-lg font-bold">Order summary</h2>

        <div className="flex justify-between text-sm text-text-muted">
          <span>
            Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </span>
          <span>{formatKES(totalKES)}</span>
        </div>

        <div className="mt-2.5 mb-4 flex justify-between border-t border-line pt-3 text-base font-bold text-ink">
          <span>Total</span>
          <span className="font-display text-[22px] font-extrabold">{formatKES(totalKES)}</span>
        </div>

        <CheckoutAction />

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-[12.5px]">
          <Link href="/products" className="font-semibold text-charcoal hover:text-red">
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={clear}
            className="text-text-muted transition-colors hover:text-red"
          >
            Clear cart
          </button>
        </div>
      </aside>
    </div>
  )
}
