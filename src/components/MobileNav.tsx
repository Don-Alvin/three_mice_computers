'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useRef, useState } from 'react'

import type { Brand } from '../payload-types'

import type { CategoryGroup } from '../lib/nav'
import { useModalPanel } from '../lib/use-modal-panel'

/**
 * Mobile category/brand menu — the prototype's `.mmenu`, which §8a.2 confirms is
 * an approved reference including its behaviour: 320px wide capped at 88vw,
 * sliding in from the **left** over the same 50%-black scrim the cart uses.
 *
 * This replaces M4's `<details>` accordion, which was always labelled interim.
 * The trigger lives here rather than in `SiteHeader` so the button and the panel
 * share one piece of state and the header stays a server component.
 */
export const MobileNav = ({
  groups,
  brands,
}: {
  groups: CategoryGroup[]
  brands: Brand[]
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const panel = useRef<HTMLElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)

  // Stable identity: the modal hook depends on it, and an inline arrow would
  // re-run the effect (re-trapping focus) on every render.
  const close = useCallback(() => setIsOpen(false), [])

  useModalPanel({ isOpen, onClose: close, panel, initialFocus: closeButton })

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Browse categories and brands"
        aria-expanded={isOpen}
        className="flex flex-col items-center gap-[3px] rounded-[9px] px-2.5 py-1.5 text-[11px] font-semibold text-charcoal transition-colors hover:bg-muted menu:hidden"
      >
        <Menu size={22} strokeWidth={1.8} aria-hidden="true" />
      </button>

      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-90 bg-ink/50 transition-opacity duration-200 menu:hidden ${
          isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      />

      <aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Categories and brands"
        inert={!isOpen}
        className={`fixed top-0 left-0 z-95 h-full w-[320px] max-w-[88vw] overflow-y-auto bg-surface shadow-[8px_0_30px_rgba(0,0,0,.2)] transition-transform duration-[260ms] menu:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4.5">
          <b className="font-display text-lg">Categories</b>
          <button
            ref={closeButton}
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="grid h-[34px] w-[34px] place-items-center rounded-[9px] text-charcoal transition-colors hover:bg-muted"
          >
            <X size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        {groups.map((group) => (
          <div key={group.value} className="py-2">
            <p className="px-5 pt-3 pb-1.5 text-[11px] font-bold tracking-[1px] text-red uppercase">
              {group.label}
            </p>
            {group.categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                onClick={close}
                className="block px-5 py-2.5 text-sm font-medium text-charcoal hover:bg-red-soft"
              >
                {category.name}
              </Link>
            ))}
          </div>
        ))}

        <div className="py-2 pb-6">
          <p className="px-5 pt-3 pb-1.5 text-[11px] font-bold tracking-[1px] text-red uppercase">
            Shop by Brand
          </p>
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}`}
              onClick={close}
              className="block px-5 py-2.5 text-sm font-medium text-charcoal hover:bg-red-soft"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </aside>
    </>
  )
}
