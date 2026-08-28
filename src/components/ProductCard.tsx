import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import type { Product } from '../payload-types'

import { formatKES } from '../lib/format'
import { resolveImage } from '../lib/media'
import { productSlug } from '../lib/product'
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

  /*
   * Spec preview: the first few spec VALUES only, never the labels. "i5, 8GB
   * RAM, 256GB SSD" carries the comparison a shopper wants at a glance and puts
   * the spec keywords on the listing page for indexing, where "Processor: i5,
   * RAM: 8GB" would spend the same single line on scaffolding. Nothing renders
   * at all when a product has no specs: an empty line would knock the cards in
   * a row out of alignment for no information.
   */
  const specValues = (product.specs ?? [])
    .slice(0, 3)
    .map((spec) => spec.value?.trim())
    .filter((value): value is string => Boolean(value))

  return (
    <article className="relative flex flex-col overflow-hidden rounded-[12px] border border-line bg-surface transition hover:-translate-y-0.5 hover:border-[#DADBDE] hover:shadow-card">
      {/*
        Fixed square box, object-contain, muted padding. Client photos arrive
        tall, wide and square, so without a fixed ratio every card in a row is a
        different height. `contain` rather than `cover` is deliberate for an
        electronics catalogue: cropping would slice the edge off a laptop screen
        or a printer tray. The leftover space is filled with the muted token so
        it reads as deliberate padding rather than a broken image.

        No radius on this box: the card is `rounded-[12px] overflow-hidden` and
        already clips these top corners. A second radius inside would show muted
        corners outside it and read as a bug.
      */}
      <div className="relative grid aspect-4/3 place-items-center overflow-hidden border-b border-line bg-muted">
        {/*
          `fill`, not width/height with `h-full`. `aspect-square` fixes this box,
          but the grid's implicit row is auto and sizes itself to the image's
          INTRINSIC height, so a tall photo made the img element 276x620 inside a
          276x276 box and `overflow-hidden` cropped it: the exact cropping
          `object-contain` is here to prevent. Wide photos letterboxed correctly,
          which is what made it look fine. An absolutely positioned image cannot
          size the row, so contain holds for every ratio.
        */}
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 720px) 50vw, (max-width: 1000px) 33vw, 25vw"
            className="object-contain"
          />
        ) : (
          <span className="text-[10px] font-semibold tracking-[1px] text-[#B9BBC0] uppercase">
            No photo yet
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        {categoryName ? (
          <span className="text-[10px] font-semibold tracking-[0.4px] text-red uppercase">
            {categoryName}
          </span>
        ) : null}

        {/*
          Whole-card link, done as a "stretched link" rather than by wrapping the
          card in an anchor. The ::after covers the whole positioned card, so
          clicking the image, the name, the specs or the price navigates, while
          the markup stays one anchor with the product name as its accessible
          name. Wrapping instead would put the add-to-cart <button> inside an
          <a>: interactive content nested in a link is invalid HTML and screen
          readers announce it inconsistently, which is the same objection as
          nesting an anchor. The button sits above the ::after on z-index and so
          never needs to cancel a navigation that was not going to start.
        */}
        <h3 className="line-clamp-2-fixed text-[13px] leading-[1.3] font-semibold text-charcoal">
          <Link
            className="after:absolute after:inset-0 after:z-0 hover:text-red"
            href={`/product/${product.slug}`}
          >
            {product.name}
          </Link>
        </h3>

        {specValues.length > 0 ? (
          /*
            One row of pills, clipped rather than wrapped. `flex-wrap` lets a
            long spec fall to a second line, and `max-h-[24px] overflow-hidden`
            then hides it, so a wordy product cannot make its card taller than
            its neighbours. Presentational only: no link, no button, no hover
            and no pointer cursor, because tapping one does nothing.
          */
          <ul className="flex max-h-[24px] flex-wrap gap-1 overflow-hidden">
            {specValues.map((value, index) => (
              // Index-qualified: two specs on one product can share a value
              // (a camera listing "1/3.0\" CMOS" twice), and a bare value key
              // collides. This list never reorders, so the index is stable.
              <li
                className="rounded-full bg-red-soft px-2 py-0.5 text-[11px] font-medium text-red-dark"
                key={`${index}-${value}`}
              >
                {value}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="font-display text-base font-extrabold text-ink">
            {formatKES(product.price)}
          </span>
          {hasDiscount ? (
            <span className="text-[11.5px] text-text-muted line-through">
              {formatKES(product.compareAtPrice as number)}
            </span>
          ) : null}
        </div>

        {/* Above the stretched link, so it adds to the cart instead of navigating. */}
        <div className="relative z-10">
          <AddToCartButton
            item={{
              id: product.id,
              slug: productSlug(product),
              name: product.name,
              price: product.price,
              // The cart renders a 62px tile, so it stores the thumbnail rather
              // than the card-sized render this component displays.
              image: resolveImage(product.images?.[0]?.image, 'thumbnail')?.url ?? '',
            }}
            stockStatus={product.stockStatus}
          />
        </div>
      </div>
    </article>
  )
}
