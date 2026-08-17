'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useRef } from 'react'

import { selectTotalItems, selectTotalKES, useCart, useCartHydrated } from '@/lib/cart'
import { formatKES } from '@/lib/format'
import { CartLine } from './CartLine'
import { EmptyCart } from './EmptyCart'

/**
 * Slide-out cart, mounted once in the layout so every page has it. Opened from
 * the header cart button only — never automatically on add-to-cart (§8a).
 * `/cart` is the full page it links on to.
 *
 * Geometry is the prototype's `.drawer` / `.overlay`: 400px wide capped at
 * 92vw, sliding in from the right over a 50%-black scrim.
 *
 * Its footer button goes to `/cart` rather than firing the WhatsApp handoff the
 * prototype wires here — that is the §8a ruling, and the checkout itself is M6.
 */
export const CartDrawer = () => {
  const items = useCart((state) => state.items)
  const isOpen = useCart((state) => state.isOpen)
  const closeCart = useCart((state) => state.closeCart)
  const totalItems = useCart(selectTotalItems)
  const totalKES = useCart(selectTotalKES)
  const hydrated = useCartHydrated()

  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    // Escape closes, and the page behind must not scroll under the drawer.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeCart()
      }
    }

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    closeButton.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, closeCart])

  // Before hydration the store cannot know what localStorage holds, so render
  // the empty shell the server rendered and fill in on the client.
  const lines = hydrated ? items : []

  return (
    <>
      <div
        onClick={closeCart}
        aria-hidden="true"
        className={`fixed inset-0 z-90 bg-ink/50 transition-opacity duration-200 ${
          isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        inert={!isOpen}
        className={`fixed top-0 right-0 z-95 flex h-full w-[400px] max-w-[92vw] flex-col bg-surface shadow-[-8px_0_30px_rgba(0,0,0,.2)] transition-transform duration-[260ms] ease-[cubic-bezier(.4,0,.2,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="flex items-center gap-2.5 font-display text-[19px] font-bold">
            Your cart
            <span className="rounded-full bg-red px-2.5 py-0.5 font-body text-xs font-bold text-white">
              {lines.length > 0 ? totalItems : 0}
            </span>
          </h2>

          <button
            ref={closeButton}
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="grid h-[34px] w-[34px] place-items-center rounded-[9px] text-charcoal transition-colors hover:bg-muted"
          >
            <X size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {lines.length === 0 ? (
            <EmptyCart />
          ) : (
            <ul>
              {lines.map((line) => (
                <CartLine key={line.id} line={line} />
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 ? (
          <div className="border-t border-line bg-surface px-5 pt-4.5 pb-5.5">
            <div className="mb-1.5 flex justify-between text-sm text-text-muted">
              <span>Subtotal</span>
              <span>{formatKES(totalKES)}</span>
            </div>

            <div className="mt-2.5 mb-1 flex justify-between text-base font-bold text-ink">
              <span>Total</span>
              <span className="font-display text-[22px] font-extrabold">{formatKES(totalKES)}</span>
            </div>

            <Link
              href="/cart"
              onClick={closeCart}
              className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-[11px] bg-ink px-4 py-3.5 text-[15px] font-extrabold text-white transition-colors hover:bg-red"
            >
              View cart &amp; checkout
            </Link>

            <p className="mt-2.5 text-center text-xs leading-relaxed text-text-muted">
              Delivery and payment are arranged with the shop on WhatsApp after you send your order.
            </p>
          </div>
        ) : null}
      </aside>
    </>
  )
}
