import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import type { Product } from '../payload-types'

import { formatKES } from '../lib/format'
import { resolveImage } from '../lib/media'
import { AddToCartButton } from './cart/AddToCartButton'

/**
 * CLIENT REVISION (plan §8a.0.1 and §8a.0.4): the card renders NO badges.
 *
 * The corner flag (HOT / DEAL / a computed discount percentage) and the stock
 * pill (Out of stock / On order) are both switched off. `badge` and
 * `stockStatus` stay on the collection so the client keeps setting them while
 * uploading, and rendering can be turned back on without a schema change or a
 * migration - the data is still there, only the visuals are gone.
 *
 * The struck-through compare-at price below is NOT a badge and stays: it is
 * price information, not a merchandising flag.
 *
 * KNOWN CONSEQUENCE, flagged in the plan as an open client decision: with no
 * stock cue anywhere in a listing, an out-of-stock product still refuses to be
 * added (§7) and `AddToCartButton` renders an inert "Out of stock" control, so
 * the shopper meets a dead button with no explanation earlier in the page. The
 * plan's own recommendation is a quiet inline note on the product detail page
 * only, never a grid badge. Not implemented here: it is the client's call.
 */
export const ProductCard = ({ product }: { product: Product }) => {
  const image = resolveImage(product.images?.[0]?.image, 'card')
  const categoryName = typeof product.category === 'object' ? product.category.name : null
  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price)

  return (
    <article className="relative flex flex-col overflow-hidden rounded-[14px] border border-line bg-surface transition hover:-translate-y-0.5 hover:border-[#DADBDE] hover:shadow-card">
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

        <AddToCartButton
          item={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            // The cart renders a 62px tile, so it stores the thumbnail rather
            // than the card-sized render this component displays.
            image: resolveImage(product.images?.[0]?.image, 'thumbnail')?.url ?? '',
          }}
          stockStatus={product.stockStatus}
        />
      </div>
    </article>
  )
}
