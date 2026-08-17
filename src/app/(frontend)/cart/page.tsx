import type { Metadata } from 'next'
import React from 'react'

import { CartPageContents } from '@/components/cart/CartPageContents'

/**
 * `/cart` — the full cart page (plan §6).
 *
 * No `revalidate`: there is nothing server-rendered to cache. The cart lives in
 * the visitor's localStorage, so this route is a static shell around a client
 * component. It is also excluded from search results — an empty cart page is
 * not a landing page.
 */
export const metadata: Metadata = {
  title: 'Your cart',
  description: 'Review your items before sending the order to the shop on WhatsApp.',
  robots: { index: false, follow: true },
}

export default function CartPage() {
  return (
    <div className="wrap py-8">
      <h1 className="mb-6 font-display text-3xl font-extrabold tracking-[-0.5px]">Your cart</h1>
      <CartPageContents />
    </div>
  )
}
