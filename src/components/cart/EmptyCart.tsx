'use client'

import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { useCart } from '@/lib/cart'

/**
 * Empty state, copied from the prototype's `.empty` block. The drawer keeps it
 * exactly as prototyped; the `/cart` page adds a way out, since landing on an
 * empty page with no next step is a dead end the drawer doesn't have.
 */
export const EmptyCart = ({ variant = 'drawer' }: { variant?: 'drawer' | 'page' }) => {
  const closeCart = useCart((state) => state.closeCart)

  return (
    <div className="px-5 py-15 text-center text-text-muted">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-muted text-[#C4C6CB]">
        <ShoppingCart size={30} strokeWidth={1.6} aria-hidden="true" />
      </div>

      <p className="mb-1 text-sm font-semibold text-charcoal">Your cart is empty</p>
      <small className="text-[13px]">Add products to send your order on WhatsApp.</small>

      {variant === 'page' ? (
        <div className="mt-6">
          <Link
            href="/products"
            onClick={closeCart}
            className="inline-flex items-center rounded-[10px] bg-ink px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red"
          >
            Browse products
          </Link>
        </div>
      ) : null}
    </div>
  )
}
