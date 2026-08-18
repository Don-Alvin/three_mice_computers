'use client'

import { ShoppingCart } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React from 'react'

import { selectTotalItems, selectTotalKES, useCart, useCartHydrated } from '@/lib/cart'
import { formatKES } from '@/lib/format'

/**
 * Sticky bottom cart bar on mobile, showing item count and running total
 * (plan §8). Opens the drawer, matching the header cart button.
 *
 * Hidden when the cart is empty — an always-present "KSh 0" bar would eat 60px
 * of a phone screen to say nothing. Also hidden on `/cart` itself, where it
 * would sit on top of the real order summary and duplicate it.
 */
export const MobileCartBar = () => {
  const openCart = useCart((state) => state.openCart)
  const totalItems = useCart(selectTotalItems)
  const totalKES = useCart(selectTotalKES)
  const hydrated = useCartHydrated()
  const pathname = usePathname()

  // The server cannot see localStorage, so the bar appears after hydration.
  // It renders nothing at all beforehand, which matches the server output.
  if (!hydrated || totalItems === 0 || pathname === '/cart') {
    return null
  }

  return (
    <>
      {/*
        Spacer so the last of the footer can still be scrolled clear of a fixed
        bar. Rendered here rather than as page padding because it must appear and
        disappear with the bar itself.
      */}
      <div aria-hidden="true" className="h-[68px] menu:hidden" />

    <div className="fixed inset-x-0 bottom-0 z-80 border-t border-line bg-surface p-3 shadow-[0_-4px_16px_rgba(20,20,20,.08)] menu:hidden">
      <button
        type="button"
        onClick={openCart}
        className="flex w-full items-center justify-between gap-3 rounded-[11px] bg-ink px-4 py-3 text-white transition-colors hover:bg-red"
      >
        <span className="flex items-center gap-2.5 text-sm font-bold">
          <ShoppingCart size={19} strokeWidth={2} aria-hidden="true" />
          View cart
          <span className="grid h-[19px] min-w-[19px] place-items-center rounded-full bg-red px-1 text-[11px] font-bold">
            {totalItems}
          </span>
        </span>
        <span className="font-display text-base font-extrabold">{formatKES(totalKES)}</span>
      </button>
    </div>
    </>
  )
}
