'use client'

import { Check } from 'lucide-react'
import React, { useEffect } from 'react'

import { useCart } from '@/lib/cart'

/** The prototype's toast lifetime. */
const VISIBLE_MS = 2000

/**
 * Add-to-cart confirmation toast, styled from the prototype's `.toast`: ink
 * pill centred 24px off the bottom, sliding up 20px as it fades in, with a
 * green check.
 *
 * This is load-bearing, not decoration (§8a). The drawer stays shut on add, so
 * without the toast the only feedback is the button flash and a header count
 * bump — both easy to miss on a phone, where the count sits far from the thumb.
 */
export const Toast = () => {
  const notice = useCart((state) => state.notice)
  const clearNotice = useCart((state) => state.clearNotice)

  const id = notice?.id

  useEffect(() => {
    if (!id) {
      return
    }

    // Keyed on `id`, so adding a second item restarts the clock rather than
    // letting the first item's timer cut the second message short.
    const timer = setTimeout(clearNotice, VISIBLE_MS)

    return () => clearTimeout(timer)
  }, [id, clearNotice])

  return (
    // Always mounted so the CSS transition has something to animate; the
    // prototype toggles the same way with `.toast` / `.toast.show`.
    <div
      role="status"
      aria-live="polite"
      // `pointer-events-none`: at 390px the toast lands squarely on the product
      // grid's own Add-to-cart buttons, so without this it would swallow taps on
      // them for its full 2s. The prototype has the same geometry and the same
      // latent problem; it just never got tapped through in a static demo.
      //
      // Raised to 88px on mobile to clear the sticky cart bar. Always correct:
      // the toast only ever fires on an add, which is precisely when the cart is
      // non-empty and the bar is therefore on screen.
      className={`pointer-events-none fixed bottom-[88px] left-1/2 z-99 flex -translate-x-1/2 items-center gap-2.5 rounded-[11px] bg-ink px-5 py-3.5 text-sm font-semibold text-white shadow-card transition-all duration-[240ms] menu:bottom-6 ${
        notice ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-5 opacity-0'
      }`}
    >
      <Check size={18} strokeWidth={2.4} aria-hidden="true" className="text-[#5EE49B]" />
      {notice?.message}
    </div>
  )
}
