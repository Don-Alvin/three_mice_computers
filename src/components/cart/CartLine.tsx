'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import type { CartItem } from '@/lib/cart'

import { useCart } from '@/lib/cart'
import { formatKES } from '@/lib/format'
import { QuantityStepper } from './QuantityStepper'

/**
 * One cart line, shared by the drawer and the `/cart` page so the two cannot
 * drift apart. Layout follows the prototype's `.ditem`: square thumbnail, name,
 * line total, stepper, then a quiet Remove link.
 *
 * The thumbnail falls back to the prototype's diagonal-stripe tile, which is
 * what it drew for every item (it had no real images).
 */
export const CartLine = ({
  line,
  variant = 'drawer',
}: {
  line: CartItem
  variant?: 'drawer' | 'page'
}) => {
  const removeItem = useCart((state) => state.removeItem)
  const setQty = useCart((state) => state.setQty)
  const closeCart = useCart((state) => state.closeCart)

  const thumbSize = variant === 'page' ? 'h-[84px] w-[84px]' : 'h-[62px] w-[62px]'

  return (
    <li className="flex gap-3 border-b border-line py-3.5 last:border-b-0">
      <div
        className={`relative shrink-0 overflow-hidden rounded-[10px] border border-line bg-[repeating-linear-gradient(135deg,#fafafb_0_10px,#f2f3f5_10px_20px)] ${thumbSize}`}
      >
        {line.image ? (
          // `fill` because the stored cart holds only a URL (plan §7's CartItem
          // has no dimensions) — the container supplies the box instead.
          <Image
            src={line.image}
            alt=""
            fill
            sizes={variant === 'page' ? '84px' : '62px'}
            className="object-contain"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-[13.5px] leading-[1.3] font-semibold">
          <Link
            href={`/product/${line.slug}`}
            onClick={closeCart}
            className="hover:text-red"
          >
            {line.name}
          </Link>
        </h4>

        <p className="mt-1.5 font-display text-[15px] font-extrabold">
          {formatKES(line.price * line.qty)}
        </p>

        {line.qty > 1 ? (
          <p className="text-[11.5px] text-text-muted">{formatKES(line.price)} each</p>
        ) : null}

        <QuantityStepper
          qty={line.qty}
          name={line.name}
          onChange={(qty) => setQty(line.id, qty)}
        />

        <div>
          <button
            type="button"
            onClick={() => removeItem(line.id)}
            className="mt-1.5 inline-block text-[11.5px] text-text-muted transition-colors hover:text-red"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}
