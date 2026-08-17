'use client'

import { useSyncExternalStore } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { MAX_CART_LINES, type ReconcileResult, type VerifiedItem } from './verify-cart'

/**
 * Cart store (plan §7).
 *
 * The cart is entirely client-side: nothing about it reaches the server, and no
 * customer PII is stored anywhere (§5.4 / plan §13). Prices held here are for
 * *display only* — they come from whatever the page showed when the item was
 * added and can be stale or edited by hand in devtools. The WhatsApp message is
 * built from `/api/verify-cart` server prices at M6, never from these values.
 */
export type CartItem = {
  id: number
  slug: string
  name: string
  price: number
  image: string
  qty: number
}

/** What a caller supplies; the store owns quantity. */
export type CartItemInput = Omit<CartItem, 'qty'>

/**
 * `/api/verify-cart` rejects more than `MAX_CART_LINES` ids (§5.2), so the cart
 * refuses one more distinct product than that rather than letting someone build
 * a cart that can never check out. Imported rather than re-declared, so the
 * guard and the limit it protects cannot drift. Quantity is capped per line
 * purely to keep a stray keypress from producing an absurd order.
 */
export { MAX_CART_LINES as MAX_LINES }
export const MAX_QTY = 99

export type AddResult = 'added' | 'increased' | 'cart-full'

/** Transient add-to-cart confirmation. `id` only exists to re-trigger the timer. */
export type CartNotice = { message: string; id: number }

type CartState = {
  items: CartItem[]
  isOpen: boolean
  notice: CartNotice | null
  /**
   * What reconciliation changed, in plain sentences. Lives on the store rather
   * than inside `CheckoutAction` because reconciliation can empty the cart, at
   * which point the checkout UI unmounts — and the shopper would be left staring
   * at "Your cart is empty" with no idea why.
   */
  reconcileNotes: string[]
  addItem: (item: CartItemInput, qty?: number) => AddResult
  removeItem: (id: number) => void
  setQty: (id: number, qty: number) => void
  clear: () => void
  openCart: () => void
  closeCart: () => void
  clearNotice: () => void
  /** Apply server truth to the cart (§5.2). Returns what it changed. */
  reconcile: (verified: VerifiedItem[]) => ReconcileResult
  setReconcileNotes: (notes: string[]) => void
}

let noticeId = 0

/** Quantities arrive from user input, so never trust them to be sane integers. */
const clampQty = (qty: number): number => {
  const whole = Math.trunc(qty)

  if (!Number.isFinite(whole) || whole < 1) {
    return 1
  }

  return Math.min(whole, MAX_QTY)
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      notice: null,
      reconcileNotes: [],

      addItem: (item, qty = 1) => {
        const { items } = get()
        const existing = items.find((line) => line.id === item.id)

        if (!existing && items.length >= MAX_CART_LINES) {
          return 'cart-full'
        }

        set({
          // Re-spreading `item` over the stored line refreshes name/price/image
          // from the page the shopper is actually looking at, so a long-lived
          // localStorage cart drifts less. Server truth still arrives at M6.
          items: existing
            ? items.map((line) =>
                line.id === item.id ? { ...line, ...item, qty: clampQty(line.qty + qty) } : line,
              )
            : [...items, { ...item, qty: clampQty(qty) }],
          // The drawer deliberately stays SHUT on add (§8a): auto-opening
          // interrupts multi-item browsing, worst on mobile. The toast is the
          // feedback that carries the news instead — required, not decorative,
          // because the header count bump is far from the thumb on a phone.
          notice: { message: `${item.name} added to cart`, id: ++noticeId },
        })

        return existing ? 'increased' : 'added'
      },

      removeItem: (id) => {
        set({ items: get().items.filter((line) => line.id !== id) })
      },

      setQty: (id, qty) => {
        if (qty < 1) {
          get().removeItem(id)

          return
        }

        set({
          items: get().items.map((line) =>
            line.id === id ? { ...line, qty: clampQty(qty) } : line,
          ),
        })
      },

      clear: () => {
        set({ items: [] })
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },

      clearNotice: () => {
        set({ notice: null })
      },

      reconcile: (verified) => {
        const byId = new Map(verified.map((item) => [item.id, item]))
        const removed: ReconcileResult['removed'] = []
        const repriced: ReconcileResult['repriced'] = []
        const next: CartItem[] = []

        // Iterating the cart, not the response, keeps the shopper's own ordering.
        for (const line of get().items) {
          const server = byId.get(line.id)

          // Absent from the response = deleted, unpublished, or never existed.
          if (!server) {
            removed.push({ name: line.name, reason: 'unavailable' })
            continue
          }

          if (server.stockStatus === 'out-of-stock') {
            removed.push({ name: server.name, reason: 'out-of-stock' })
            continue
          }

          if (server.price !== line.price) {
            repriced.push({ name: server.name, from: line.price, to: server.price })
          }

          // Name and slug are refreshed too: a renamed product should not go to
          // WhatsApp under its old name, and a changed slug would 404 the link.
          next.push({ ...line, name: server.name, slug: server.slug, price: server.price })
        }

        set({ items: next })

        return { removed, repriced }
      },

      setReconcileNotes: (notes) => {
        set({ reconcileNotes: notes })
      },
    }),
    {
      name: 'cart-v1',
      version: 1,
      // Only the contents survive a reload — a drawer that reopens itself, or a
      // toast replayed from last week, would be a bug rather than a feature.
      partialize: (state) => ({ items: state.items }),
    },
  ),
)

export const selectTotalItems = (state: CartState): number =>
  state.items.reduce((total, line) => total + line.qty, 0)

export const selectTotalKES = (state: CartState): number =>
  state.items.reduce((total, line) => total + line.price * line.qty, 0)

const subscribeToNothing = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

/**
 * True only after the first client render has happened.
 *
 * The server renders an empty cart because it cannot see localStorage, so any
 * component that paints cart contents must render the same empty markup on its
 * first client pass and fill in afterwards. Reading the rehydrated store
 * directly would produce a hydration mismatch on every reload with a full cart.
 */
export const useCartHydrated = (): boolean =>
  // `useSyncExternalStore` rather than a `useEffect` mount flag: it takes an
  // explicit server snapshot, which is precisely this problem, and it does not
  // trip react-hooks/set-state-in-effect. Nothing is subscribed to — the value
  // goes false → true exactly once, when the client takes over.
  useSyncExternalStore(subscribeToNothing, getClientSnapshot, getServerSnapshot)
