'use client'

import { Minus, Plus } from 'lucide-react'
import React from 'react'

import { MAX_QTY } from '@/lib/cart'

/**
 * Quantity control, styled from the prototype's `.qty` (28px square buttons in a
 * bordered pill). Minus at 1 removes the line, which is what the prototype does
 * — its `changeQty` drops the item once qty hits zero.
 */
export const QuantityStepper = ({
  qty,
  name,
  onChange,
}: {
  qty: number
  name: string
  onChange: (qty: number) => void
}) => (
  <div className="mt-2 inline-flex items-center rounded-lg border border-line">
    <button
      type="button"
      onClick={() => onChange(qty - 1)}
      aria-label={qty === 1 ? `Remove ${name} from cart` : `Decrease quantity of ${name}`}
      className="grid h-7 w-7 place-items-center text-charcoal transition-colors hover:text-red"
    >
      <Minus size={14} strokeWidth={2.2} aria-hidden="true" />
    </button>

    {/*
      aria-live so a screen reader hears the new quantity after a tap; the
      buttons themselves are the controls, this is just the readout.
    */}
    <span aria-live="polite" className="min-w-7 text-center text-[13.5px] font-semibold">
      {qty}
    </span>

    <button
      type="button"
      onClick={() => onChange(qty + 1)}
      disabled={qty >= MAX_QTY}
      aria-label={`Increase quantity of ${name}`}
      className="grid h-7 w-7 place-items-center text-charcoal transition-colors hover:text-red disabled:cursor-not-allowed disabled:text-line"
    >
      <Plus size={14} strokeWidth={2.2} aria-hidden="true" />
    </button>
  </div>
)
