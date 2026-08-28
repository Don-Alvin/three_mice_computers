'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

import type { HeroSlide } from '../lib/hero'

import heroBanner from '../app/hero-banner.jpg'

import { formatKES } from '../lib/format'

/** How long a slide holds before the carousel advances (plan §8a.0.5). */
const ADVANCE_MS = 6000

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

const subscribeToMotionPreference = (onChange: () => void): (() => void) => {
  const query = window.matchMedia(REDUCED_MOTION)

  query.addEventListener('change', onChange)

  return () => query.removeEventListener('change', onChange)
}

const motionSnapshot = (): boolean => window.matchMedia(REDUCED_MOTION).matches

/**
 * Read through `useSyncExternalStore` rather than an effect that calls
 * `setState`: the mount-flag idiom trips `react-hooks/set-state-in-effect` and
 * fails CI (claude.md, Conventions), and a media query is precisely the
 * external store this hook exists for. It also keeps the preference live, so a
 * shopper who turns motion off in OS settings stops the carousel without a
 * reload.
 *
 * The server snapshot claims "reduced". The value only gates a timer that
 * cannot start until after hydration, so it never reaches the markup and cannot
 * cause a mismatch, but defaulting this way means any mistake here leaves the
 * carousel still rather than animating at somebody who asked us not to.
 */
const motionServerSnapshot = (): boolean => true

/**
 * The homepage hero (plan §8a.0.5).
 *
 * Laid out to the reference design the client supplied: fixed copy down the
 * left, the product photo floating free on the right of the gradient, and the
 * call to action sharing a row with the carousel controls. The panel keeps the
 * brand red rather than the reference's navy, per §8's tokens.
 */
export const HeroCarousel = ({ slides }: { slides: HeroSlide[] }) => {
  const count = slides.length
  const [index, setIndex] = useState(0)

  /*
   * Hover and focus are tracked separately rather than through one `isPaused`
   * flag. With a single flag, tabbing out of the controls while the pointer is
   * still resting on the carousel clears the pause the pointer is holding, and
   * the slides start moving under a stationary mouse.
   */
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const isPaused = isHovered || isFocused

  const prefersReducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    motionSnapshot,
    motionServerSnapshot,
  )

  // All three use the functional form so the auto-advance effect below can
  // depend on `count` alone and does not tear down its timer on every render.
  const goTo = useCallback((next: number) => setIndex(((next % count) + count) % count), [count])
  const goPrevious = useCallback(() => setIndex((at) => (at - 1 + count) % count), [count])
  const goNext = useCallback(() => setIndex((at) => (at + 1) % count), [count])

  useEffect(() => {
    if (prefersReducedMotion || isPaused || count < 2) {
      return
    }

    const timer = window.setInterval(() => setIndex((at) => (at + 1) % count), ADVANCE_MS)

    return () => window.clearInterval(timer)
  }, [count, isPaused, prefersReducedMotion])

  // Wrapped, not read raw: a soft navigation back to the homepage can hand this
  // component a shorter `slides` array while the old index is still in state,
  // and `slides[7]` of a 5-slide rotation is a crash, not a blank slide.
  const active = count > 0 ? index % count : 0
  const slide: HeroSlide | undefined = slides[active]
  const hasDiscount = Boolean(slide?.compareAtPrice && slide.compareAtPrice > slide.price)

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
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
    <section
      aria-label="Featured products"
      aria-roledescription="carousel"
      /*
       * The red gradient stays as the base layer even though a photo now covers
       * it: the banner sits on a negative z-index, which paints above this
       * background but below the copy, so a missing or slow banner degrades to
       * the brand panel instead of to unreadable white-on-white.
       */
      className="relative isolate flex max-h-[calc(100svh-260px)] min-h-[300px] items-center overflow-hidden rounded-2xl bg-gradient-to-br from-red to-red-dark text-white sm:min-h-[340px] lg:min-h-[380px]"
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/*
        One static banner for the whole hero, imported rather than served
        from public/: a static import gets a content-hashed filename (so it can
        be cached forever) and hands next/image the intrinsic dimensions.

        The carousel rotates the TEXT
        only, so this image never changes and is a plain LCP candidate: `fill` +
        `priority`, decoded once, no per-slide swap.

        `alt=""` because it is decoration. The hero's information is the heading
        and the product line beside it, both real text; describing the banner
        would only make a screen reader read scenery before the point.
      */}
      <Image
        alt=""
        className="-z-10 object-cover object-center"
        fill
        priority
        sizes="(max-width: 1200px) 100vw, 1200px"
        src={heroBanner}
      />

      {/*
        Readability wash, weighted to the left and fading out before the right
        edge so the products in the banner stay visible rather than being
        greyed out behind a full-width scrim.
      */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/65 to-transparent"
      />
      {/*
        Phones only. The horizontal wash above is weighted left so the products
        on the right of the banner stay visible, which works while the copy sits
        in the left column. Below `sm` the copy spans the full width and its
        right edge lands on the bright laptop screen in the photo, so a flat
        wash goes underneath it there and nowhere else.
      */}
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/30 sm:hidden" />

      <div className="relative w-full max-w-[620px] px-5 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
        <p className="mb-2.5 text-[11px] font-bold tracking-[2px] uppercase opacity-90 sm:text-xs">
          Trusted computer store
        </p>

        {/*
          The headline does NOT rotate. A carousel that swaps the page's h1
          every six seconds leaves the document with no stable subject for
          search engines and reads as a moving target to a screen reader, so
          the proposition stays put and the product name sits under it.
        */}
        <h1 className="mb-2.5 max-w-[20ch] font-display text-[clamp(22px,2.7vw,34px)] leading-[1.05] font-extrabold tracking-[-0.8px] drop-shadow-[0_2px_10px_rgba(0,0,0,.45)]">
          Genuine tech, delivered across Kenya.
        </h1>

        <p className="mb-3 max-w-[54ch] text-[12.5px] leading-tight opacity-90 sm:mb-3.5 sm:text-[14px] sm:leading-snug">
          Laptops, CCTV, networking, printers and accessories: real stock, fair prices, warranty
          backed.
        </p>

        {slide ? (
          <div
            aria-label={`${active + 1} of ${count}`}
            aria-roledescription="slide"
            className="animate-hero-slide mb-4 border-l-2 border-white/35 pl-3.5"
            key={`copy-${slide.id}`}
            role="group"
          >
            {slide.categoryName ? (
              <p className="text-[11px] font-semibold tracking-[1.4px] text-white/75 uppercase">
                {slide.categoryName}
              </p>
            ) : null}

            {/*
              Stretched link: the ::after covers the whole positioned section, so
              the banner area is clickable through to the product on show without
              wrapping the prev/next buttons in an anchor, which would be invalid
              markup. The controls below sit above it on z-index.
            */}
            <p className="mt-0.5 font-display text-base leading-snug font-bold sm:text-lg">
              <Link
                className="after:absolute after:inset-0 after:z-10 hover:underline"
                href={`/product/${slide.slug}`}
              >
                {slide.name}
              </Link>
            </p>

            <p className="mt-1 flex items-baseline gap-2.5">
              <span className="font-display text-[19px] font-extrabold sm:text-[22px]">
                {formatKES(slide.price)}
              </span>
              {hasDiscount ? (
                <span className="text-[13px] text-white/70 line-through">
                  {formatKES(slide.compareAtPrice as number)}
                </span>
              ) : null}
            </p>
          </div>
        ) : null}

        <div className="relative z-20 flex flex-wrap items-center gap-4">
          <Link
            className="inline-flex items-center gap-2 rounded-[10px] bg-white px-5 py-3 text-[14px] font-bold text-ink shadow-[0_10px_24px_rgba(0,0,0,.28)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,.34)] sm:text-[15px]"
            href="#featured"
          >
            Shop featured
          </Link>

          {count > 1 ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Previous product"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  onClick={goPrevious}
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" size={19} strokeWidth={2.4} />
                </button>
                <button
                  aria-label="Next product"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  onClick={goNext}
                  type="button"
                >
                  <ChevronRight aria-hidden="true" size={19} strokeWidth={2.4} />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {slides.map((dot, at) => (
                  <button
                    aria-current={at === active}
                    aria-label={`Show product ${at + 1} of ${count}`}
                    className={`h-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none ${
                      at === active ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                    key={dot.id}
                    onClick={() => goTo(at)}
                    type="button"
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/*
        Announce the slide only when the shopper is driving. An auto-rotating
        carousel that announces every tick talks over everything else a screen
        reader user is doing, so the live region stays off until the rotation is
        paused or motion is turned down.
      */}
      <span aria-live={isPaused || prefersReducedMotion ? 'polite' : 'off'} className="sr-only">
        {slide ? `${slide.name}, ${formatKES(slide.price)}` : ''}
      </span>
    </section>
  )
}
