'use client'

import { MessageCircle } from 'lucide-react'
import React from 'react'

/**
 * The checkout step, deliberately isolated in its own component (plan §7) so
 * Phase 2 can swap the WhatsApp handoff for the Paystack flow without touching
 * the cart page around it.
 *
 * **Milestone 6 fills this in.** The button is inert here because everything it
 * needs belongs to M6: `/api/verify-cart`, price/stock reconciliation, the
 * message built from *server* prices (§5.2), the `wa.me` handoff, and the
 * post-checkout state. Wiring any of it now would mean shipping a checkout that
 * sends localStorage prices — the one thing §5.2 exists to prevent.
 *
 * The glyph is a Lucide stand-in; M6 brings the real WhatsApp brand mark from
 * `@icons-pack/react-simple-icons` (pre-approved in §8 for exactly that).
 */
export const CheckoutAction = () => (
  <div>
    <button
      type="button"
      disabled
      className="flex w-full items-center justify-center gap-2.5 rounded-[11px] bg-wa px-4 py-3.5 text-[15px] font-extrabold text-wa-ink transition-colors hover:bg-wa-dark disabled:cursor-not-allowed disabled:opacity-50"
    >
      <MessageCircle size={20} strokeWidth={2.2} aria-hidden="true" />
      Checkout on WhatsApp
    </button>

    <p className="mt-2.5 text-center text-xs leading-relaxed text-text-muted">
      Your order is sent to the shop on WhatsApp to confirm stock, payment via M-Pesa and delivery.
    </p>

    <p className="mt-2 text-center text-xs font-semibold text-red">
      Checkout is wired up in the next milestone.
    </p>
  </div>
)
