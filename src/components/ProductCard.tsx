import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import type { Product } from '../payload-types'

import { discountPercent, formatKES } from '../lib/format'
import { resolveImage } from '../lib/media'

const STOCK_LABELS: Record<Product['stockStatus'], string | null> = {
  'in-stock': null, // no badge when everything is normal (plan §8)
  'out-of-stock': 'Out of stock',
  'on-order': 'On order',
}

/**
 * Corner flag. A real discount outranks the manual badge: if a product has a
 * compare-at price, showing the saving is more useful to the shopper than
 * "HOT" (plan §8a, and the prototype's own precedence).
 */
const cornerFlag = (product: Product) => {
  const { badge, compareAtPrice, price } = product

  if (compareAtPrice && compareAtPrice > price) {
    return { label: `-${discountPercent(price, compareAtPrice)}%`, className: 'bg-ink' }
  }

  if (badge === 'hot') {
    return { label: 'HOT', className: 'bg-red' }
  }

  if (badge === 'deal') {
    return { label: 'DEAL', className: 'bg-ink' }
  }

  return null
}

export const ProductCard = ({ product }: { product: Product }) => {
  const image = resolveImage(product.images?.[0]?.image, 'card')
  const flag = cornerFlag(product)
  const stockLabel = STOCK_LABELS[product.stockStatus]
  const categoryName = typeof product.category === 'object' ? product.category.name : null
  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price)

  return (
    <article className="relative flex flex-col overflow-hidden rounded-[14px] border border-line bg-surface transition hover:-translate-y-0.5 hover:border-[#DADBDE] hover:shadow-card">
      {flag ? (
        <span
          className={`absolute top-2.5 left-2.5 z-10 rounded-md px-2.5 py-1 text-[11px] font-extrabold tracking-[0.4px] text-white ${flag.className}`}
        >
          {flag.label}
        </span>
      ) : null}

      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative grid aspect-square place-items-center border-b border-line bg-muted">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(max-width: 720px) 50vw, (max-width: 1000px) 33vw, 25vw"
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-[10px] font-semibold tracking-[1px] text-[#B9BBC0] uppercase">
              No photo yet
            </span>
          )}

          {stockLabel ? (
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-ink/85 px-2.5 py-1 text-[11px] font-semibold text-white">
              {stockLabel}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        {categoryName ? (
          <span className="text-[11px] font-semibold tracking-[0.4px] text-red uppercase">
            {categoryName}
          </span>
        ) : null}

        <h3 className="line-clamp-2-fixed text-sm leading-[1.35] font-semibold text-charcoal">
          <Link href={`/product/${product.slug}`} className="hover:text-red">
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex items-baseline gap-2">
          <span className="font-display text-lg font-extrabold text-ink">
            {formatKES(product.price)}
          </span>
          {hasDiscount ? (
            <span className="text-[12.5px] text-text-muted line-through">
              {formatKES(product.compareAtPrice as number)}
            </span>
          ) : null}
        </div>

        {/*
          Add-to-cart is Milestone 5. Rendered so the card matches the approved
          prototype, but inert — there is no cart store yet. See summary.
        */}
        <span
          aria-hidden="true"
          className="mt-1.5 flex items-center justify-center gap-2 rounded-[9px] bg-ink px-3 py-2.5 text-[13.5px] font-bold text-white"
        >
          Add to cart
        </span>
      </div>
    </article>
  )
}
