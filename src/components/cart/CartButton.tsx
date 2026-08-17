'use client'

import { ShoppingCart } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { selectTotalItems, useCart, useCartHydrated } from '@/lib/cart'

/**
 * Header cart button. Opens the drawer, which is what the prototype's own
 * `onclick="openCart()"` does — the full `/cart` page is one click further in,
 * from the drawer's footer.
 *
 * The count stays at 0 until hydration so the first client render matches the
 * server HTML; the prototype's `bump()` scale-up then fires whenever it grows.
 */
export const CartButton = () => {
  const openCart = useCart((state) => state.openCart)
  const totalItems = useCart(selectTotalItems)
  const hydrated = useCartHydrated()

  const count = hydrated ? totalItems : 0
  const [bumping, setBumping] = useState(false)
  const previous = useRef(count)

  useEffect(() => {
    if (count <= previous.current) {
      previous.current = count

      return
    }

    previous.current = count
    setBumping(true)

    const timer = setTimeout(() => setBumping(false), 180)

    return () => clearTimeout(timer)
  }, [count])

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
      className="relative flex flex-col items-center gap-[3px] rounded-[9px] px-2.5 py-1.5 text-[11px] font-semibold text-charcoal transition-colors hover:bg-muted"
    >
      <ShoppingCart size={22} strokeWidth={1.8} aria-hidden="true" />
      <span className="hidden menu:inline">Cart</span>
      <span
        aria-hidden="true"
        className={`absolute top-0 right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red px-1 text-[10px] font-bold text-white transition-transform duration-150 ${
          bumping ? 'scale-140' : 'scale-100'
        }`}
      >
        {count}
      </span>
    </button>
  )
}
