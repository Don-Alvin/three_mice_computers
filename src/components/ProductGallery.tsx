'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useState } from 'react'

import type { ResolvedImage } from '../lib/media'

/**
 * Product image gallery.
 *
 * Deliberately NOT the hero carousel. The hero rotates on a timer because it is
 * merchandising and nobody asked it to move; this one moves ONLY when the
 * shopper says so. Somebody comparing the port layout on two photos of the same
 * laptop does not want the image sliding out from under them, so there is no
 * interval here at all, and therefore no reduced-motion gate to go with it: the
 * only motion is a fade on a swap the shopper themselves asked for, which the
 * stylesheet's global reduced-motion block already turns off.
 *
 * Three ways to change the image, because they suit different hands: click the
 * photo itself to advance, use the arrows, or pick a thumbnail directly.
 */
export const ProductGallery = ({ images, name }: { images: ResolvedImage[]; name: string }) => {
  const count = images.length
  const [active, setActive] = useState(0)

  const goPrevious = useCallback(() => setActive((at) => (at - 1 + count) % count), [count])
  const goNext = useCallback(() => setActive((at) => (at + 1) % count), [count])

  if (count === 0) {
    return (
      <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl border border-line bg-surface">
        <span className="text-xs font-semibold tracking-[1px] text-[#B9BBC0] uppercase">
          No photo yet
        </span>
      </div>
    )
  }

  const current = images[active % count]
  const hasMany = count > 1

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasMany) {
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goPrevious()
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goNext()
    }
  }

  return (
    <div onKeyDown={onKeyDown}>
      <div className="group relative grid aspect-square place-items-center overflow-hidden rounded-2xl border border-line bg-surface">
        {/*
          `fill` for the same reason as the product card: with width/height and
          `h-full` a tall photo sizes the grid row to its own intrinsic height
          and overflows this box, and the shopper inspecting a product closely
          is exactly who must not be handed a cropped one.
        */}
        <Image
          alt={current.alt || name}
          className="animate-hero-slide object-contain"
          fill
          key={current.url}
          // The gallery is the page's LCP element.
          priority={active === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          src={current.url}
        />

        {hasMany ? (
          <>
            {/*
              Click anywhere on the photo to advance. Hidden from assistive tech
              and skipped by Tab on purpose: it duplicates the "Next image"
              arrow beside it, and announcing the same control twice is noise.
              Keyboard and screen reader users get the real buttons below.
            */}
            <button
              aria-hidden="true"
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={goNext}
              tabIndex={-1}
              type="button"
            />

            <button
              aria-label="Previous image"
              className="absolute top-1/2 left-3 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 text-charcoal shadow-card transition hover:bg-surface hover:text-red focus-visible:ring-2 focus-visible:ring-red focus-visible:outline-none"
              onClick={goPrevious}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={20} strokeWidth={2.4} />
            </button>

            <button
              aria-label="Next image"
              className="absolute top-1/2 right-3 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface/90 text-charcoal shadow-card transition hover:bg-surface hover:text-red focus-visible:ring-2 focus-visible:ring-red focus-visible:outline-none"
              onClick={goNext}
              type="button"
            >
              <ChevronRight aria-hidden="true" size={20} strokeWidth={2.4} />
            </button>

            <span className="absolute right-3 bottom-3 z-20 rounded-full bg-ink/75 px-2.5 py-1 text-[11px] font-semibold text-white">
              {active + 1} / {count}
            </span>
          </>
        ) : null}
      </div>

      {hasMany ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              aria-current={index === active}
              aria-label={`Show image ${index + 1} of ${count}`}
              className={`relative grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-lg border bg-surface transition focus-visible:ring-2 focus-visible:ring-red focus-visible:outline-none ${
                index === active
                  ? 'border-red ring-1 ring-red'
                  : 'border-line hover:border-[#DADBDE]'
              }`}
              key={`${image.url}-${index}`}
              onClick={() => setActive(index)}
              type="button"
            >
              <Image alt="" className="object-contain" fill sizes="120px" src={image.url} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
