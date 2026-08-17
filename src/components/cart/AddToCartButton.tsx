'use client'

import { Check, ShoppingCart } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import type { CartItemInput } from '@/lib/cart'
import type { Product } from '@/payload-types'

import { MAX_LINES, useCart } from '@/lib/cart'

/**
 * Add-to-cart, on both the product card and the detail page.
 *
 * Styling is the prototype's `.card .add` — ink button, red on hover, and the
 * green `.added` confirmation that reverts after ~1.1s.
 *
 * Adding does NOT open the drawer (§8a): auto-opening interrupts multi-item
 * browsing on a grid, worst on mobile. Feedback is this flash plus the header
 * count bump plus the toast, exactly as the prototype scripts it.
 *
 * Out-of-stock products cannot be added: `/api/verify-cart` would strip the line
 * at M6 anyway (§5.2), and refusing up front is honest rather than a surprise at
 * checkout. "On order" stays addable — the shop sources those.
 */
export const AddToCartButton = ({
  item,
  stockStatus,
  variant = 'card',
}: {
  item: CartItemInput
  stockStatus: Product['stockStatus']
  variant?: 'card' | 'detail'
}) => {
  const addItem = useCart((state) => state.addItem)
  const [added, setAdded] = useState(false)
  const [full, setFull] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const base =
    variant === 'detail'
      ? 'mt-6 w-full max-w-sm rounded-[11px] px-4 py-3.5 text-[15px]'
      : 'mt-1.5 rounded-[9px] px-3 py-2.5 text-[13.5px]'

  if (stockStatus === 'out-of-stock') {
    return (
      <span
        aria-disabled="true"
        className={`flex items-center justify-center gap-2 bg-muted font-bold text-text-muted ${base}`}
      >
        Out of stock
      </span>
    )
  }

  const onClick = () => {
    const result = addItem(item)

    if (result === 'cart-full') {
      setFull(true)

      return
    }

    setFull(false)
    setAdded(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAdded(false), 1100)
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center justify-center gap-2 font-bold text-white transition-colors ${
          added ? 'bg-ok' : 'bg-ink hover:bg-red'
        } ${base}`}
      >
        {added ? (
          <Check size={16} strokeWidth={2.4} aria-hidden="true" />
        ) : (
          <ShoppingCart size={16} strokeWidth={2} aria-hidden="true" />
        )}
        {added ? 'Added' : 'Add to cart'}
      </button>

      {full ? (
        <p role="alert" className="mt-1.5 text-[11.5px] text-red">
          Your cart is full at {MAX_LINES} different products. Remove one to add this.
        </p>
      ) : null}
    </>
  )
}
