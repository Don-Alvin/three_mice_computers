'use client'

import { AlertTriangle, ExternalLink, Loader2, MessageCircle } from 'lucide-react'
import React, { useState } from 'react'

import type { OrderLine } from '@/lib/whatsapp'
import type { VerifyCartResponse } from '@/lib/verify-cart'

import { useCart } from '@/lib/cart'
import { formatKES } from '@/lib/format'
import { buildOrderMessage, buildWhatsAppUrl, isUsableWhatsAppNumber } from '@/lib/whatsapp'

/**
 * The whole checkout step, deliberately in one component (plan §7) so Phase 2
 * swaps it for Paystack without touching the cart around it.
 *
 * Order of operations is the point of §5.2: verify → reconcile → build → hand
 * off. The message is assembled from the **server's** response joined to local
 * quantities, never from the store's prices, so even a bug in `reconcile` cannot
 * put a stale price in front of the shop.
 *
 * Name and location are optional, live only in the message string, and are never
 * sent anywhere — `/api/verify-cart` receives ids and nothing else (plan §13).
 */
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL

/** Keeps the wa.me URL a sane length, and a shop note is not an essay. */
const FIELD_MAX = 60

type Phase =
  | { kind: 'idle' }
  | { kind: 'verifying' }
  /** Reconciliation changed something — never hand off silently, make them look. */
  | { kind: 'changed' }
  | { kind: 'error'; message: string }
  /**
   * Handed off. `url` is kept because the page must always offer a tap-through:
   * `window.open` with `noopener` returns null on success *and* on refusal (that
   * is the spec — the opener must not receive a handle), so there is no way to
   * tell whether WhatsApp actually opened. Claiming either would be a guess.
   */
  | { kind: 'sent'; url: string }

export const CheckoutAction = () => {
  const items = useCart((state) => state.items)
  const reconcile = useCart((state) => state.reconcile)
  const setReconcileNotes = useCart((state) => state.setReconcileNotes)

  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [customerName, setCustomerName] = useState('')
  const [location, setLocation] = useState('')

  // A preview that missed the env var would otherwise ship a wa.me link to
  // nobody. Better to say so than to hand the client a dead button.
  if (!isUsableWhatsAppNumber(WHATSAPP_NUMBER)) {
    return (
      <div className="rounded-xl bg-muted p-4 text-[13px] text-text-muted">
        <p className="flex items-center gap-2 font-semibold text-charcoal">
          <AlertTriangle size={16} strokeWidth={2.2} aria-hidden="true" className="text-red" />
          Checkout unavailable
        </p>
        <p className="mt-1.5">
          The shop&apos;s WhatsApp number is not configured for this deployment
          (<code>NEXT_PUBLIC_WHATSAPP_NUMBER</code>).
        </p>
      </div>
    )
  }

  const checkout = async () => {
    setPhase({ kind: 'verifying' })
    setReconcileNotes([])

    let verified: VerifyCartResponse

    try {
      const response = await fetch('/api/verify-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Ids only. Nothing about the shopper leaves the browser.
        body: JSON.stringify({ productIds: items.map((line) => line.id) }),
      })

      if (!response.ok) {
        throw new Error(`verify-cart responded ${response.status}`)
      }

      verified = (await response.json()) as VerifyCartResponse
    } catch {
      setPhase({
        kind: 'error',
        message: 'Could not reach the shop to confirm prices. Check your connection and try again.',
      })

      return
    }

    const result = reconcile(verified.items)

    if (result.removed.length > 0 || result.repriced.length > 0) {
      setReconcileNotes([
        ...result.removed.map(({ name, reason }) =>
          reason === 'out-of-stock'
            ? `${name} is out of stock and was removed from your cart.`
            : `${name} is no longer available and was removed from your cart.`,
        ),
        ...result.repriced.map(
          ({ name, from, to }) =>
            `${name} is now ${formatKES(to)} (was ${formatKES(from)}). Your cart has been updated.`,
        ),
      ])

      // Stop here on purpose. The shopper agreed to a different cart than the one
      // that exists now, so they get to see the change and tap again.
      setPhase({ kind: 'changed' })

      return
    }

    // Built from the verified response, joined to local quantities — in cart
    // order, so the message matches what they were just looking at.
    const byId = new Map(verified.items.map((item) => [item.id, item]))
    const lines: OrderLine[] = items.flatMap((line) => {
      const server = byId.get(line.id)

      return server ? [{ name: server.name, slug: server.slug, price: server.price, qty: line.qty }] : []
    })

    if (lines.length === 0) {
      setPhase({ kind: 'error', message: 'Nothing in your cart is available to order right now.' })

      return
    }

    const message = buildOrderMessage({
      lines,
      customerName: customerName.trim() || undefined,
      location: location.trim() || undefined,
      baseUrl: SERVER_URL || window.location.origin,
    })

    const url = buildWhatsAppUrl(message, WHATSAPP_NUMBER)

    // Attempt the hand-off, then show a tap-through regardless. Two reasons it
    // can fail and one reason we cannot detect it: the user activation that
    // permits a popup may have expired during the fetch (likeliest on the slow
    // mobile connections this shop serves), a blocker may refuse it — and with
    // `noopener` the return value is null either way, success included.
    window.open(url, '_blank', 'noopener,noreferrer')

    setPhase({ kind: 'sent', url })
  }

  if (phase.kind === 'sent') {
    return (
      <div>
        <p className="mb-3 rounded-xl bg-wa/12 px-4 py-3 text-[13.5px] font-semibold text-charcoal">
          Your order is ready — send the message in WhatsApp to place it.
        </p>

        {/*
          Always a real link, never presented as a fallback for a failure we
          cannot observe: if WhatsApp already opened, this is just the way back
          to it; if the popup was refused, this is the only way through.
        */}
        <a
          href={phase.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2.5 rounded-[11px] bg-wa px-4 py-3.5 text-[15px] font-extrabold text-wa-ink transition-colors hover:bg-wa-dark"
        >
          <ExternalLink size={18} strokeWidth={2.2} aria-hidden="true" />
          Open WhatsApp
        </a>

        <p className="mt-2 text-center text-xs text-text-muted">
          Didn&apos;t open automatically? Tap the button above.
        </p>

        {/* Plan §7 step 4: say what happens next, and offer to clear. */}
        <div className="mt-4 rounded-xl border border-line p-4 text-[13px] leading-relaxed text-text-muted">
          <p className="mb-1.5 font-semibold text-charcoal">What happens next</p>
          <p>
            The shop confirms stock and the total on WhatsApp, then arranges payment via M-Pesa and
            delivery with you directly.
          </p>
        </div>

        {/*
          No "Clear cart" here on purpose: the cart page already offers one just
          below, and two identical buttons stacked in one column is worse than
          one. §7's "offer to clear the cart" is satisfied by that button —
          clearing is a cart action, not a step of the checkout.
        */}
      </div>
    )
  }

  const busy = phase.kind === 'verifying'

  return (
    <div>
      {/* Optional, message-only, never stored server-side (plan §7 step 1, §13). */}
      <div className="mb-4 flex flex-col gap-2.5">
        <label className="text-[12.5px] font-semibold text-charcoal">
          Your name <span className="font-normal text-text-muted">(optional)</span>
          <input
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            maxLength={FIELD_MAX}
            autoComplete="name"
            placeholder="So the shop knows who is ordering"
            className="mt-1 w-full rounded-[9px] border border-line bg-muted px-3 py-2 text-[13.5px] font-normal outline-none transition-colors focus:border-red"
          />
        </label>

        <label className="text-[12.5px] font-semibold text-charcoal">
          Delivery location <span className="font-normal text-text-muted">(optional)</span>
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            maxLength={FIELD_MAX}
            placeholder="e.g. Nakuru CBD"
            className="mt-1 w-full rounded-[9px] border border-line bg-muted px-3 py-2 text-[13.5px] font-normal outline-none transition-colors focus:border-red"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={checkout}
        disabled={busy || items.length === 0}
        className="flex w-full items-center justify-center gap-2.5 rounded-[11px] bg-wa px-4 py-3.5 text-[15px] font-extrabold text-wa-ink transition-colors hover:bg-wa-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <Loader2 size={20} strokeWidth={2.4} aria-hidden="true" className="animate-spin" />
        ) : (
          <MessageCircle size={20} strokeWidth={2.2} aria-hidden="true" />
        )}
        {busy ? 'Confirming prices…' : 'Checkout on WhatsApp'}
      </button>

      {phase.kind === 'changed' ? (
        <p role="alert" className="mt-2.5 text-center text-xs font-semibold text-red">
          Your cart changed — check it above, then tap again to send.
        </p>
      ) : null}

      {phase.kind === 'error' ? (
        <p role="alert" className="mt-2.5 text-center text-xs font-semibold text-red">
          {phase.message}
        </p>
      ) : null}

      <p className="mt-2.5 text-center text-xs leading-relaxed text-text-muted">
        Your order is sent to the shop on WhatsApp to confirm stock, payment via M-Pesa and delivery.
      </p>
    </div>
  )
}
