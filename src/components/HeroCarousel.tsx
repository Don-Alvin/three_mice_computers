'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

import type { HeroSlide } from '../lib/hero'

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
 * The homepage hero (plan §8a.0.5): the product photo is the hero, filling the
 * whole panel, with the proposition and the slide's own details laid over it.
 *
 * The headline does NOT rotate. A carousel that swaps the page's h1 every six
 * seconds leaves the document with no stable subject for search engines and
 * reads as a moving target to a screen reader, so the proposition stays put and
 * the rotating product name sits under it as ordinary text.
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
      className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-red to-red-dark text-white"
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {slide?.image ? (
        <div className="absolute inset-0 -z-10 animate-hero-slide" key={slide.id}>
          <Image
            alt={slide.image.alt}
            className="h-full w-full object-cover"
            fill
            // The hero fills the content column and is the page's likely LCP
            // element, so the first slide is not lazy loaded.
            priority={active === 0}
            sizes="(max-width: 1200px) 100vw, 1200px"
            src={slide.image.url}
          />
          {/*
            Two scrims, not one, and the heavy one is red rather than neutral.
            The horizontal pass keeps the left column readable on a wide screen
            while leaving the right of the photo visible; the flat pass
            underneath carries the mobile layout, where the text sits over the
            middle of the image and a left-to-right gradient alone runs out of
            cover. Tinting red keeps the brand in the hero: a neutral scrim over
            a light product photo leaves the panel a grey slab with no colour in
            it at all, which is exactly what the placeholder images show today.
          */}
          <span aria-hidden="true" className="absolute inset-0 bg-ink/30" />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-red-dark/95 via-red-dark/65 to-transparent"
          />
        </div>
      ) : null}

      {/*
        Announce the slide only when the shopper is driving. An auto-rotating
        carousel that announces every tick talks over everything else a screen
        reader user is doing, so the live region stays off until the rotation is
        paused or motion is turned down.
      */}
      <div
        aria-live={isPaused || prefersReducedMotion ? 'polite' : 'off'}
        className="flex min-h-[440px] flex-col justify-center px-6 py-11 sm:px-10 lg:min-h-[480px]"
      >
        <p className="mb-3.5 text-xs font-bold tracking-[2px] uppercase opacity-90">
          Trusted computer store
        </p>
        <h1 className="mb-4 max-w-[15ch] font-display text-[clamp(28px,4vw,46px)] leading-[1.04] font-extrabold tracking-[-1px] drop-shadow-[0_2px_12px_rgba(0,0,0,.35)]">
          Genuine tech, delivered across Kenya.
        </h1>

        {slide ? (
          <div
            aria-label={`${active + 1} of ${count}`}
            aria-roledescription="slide"
            className="animate-hero-slide max-w-[42ch]"
            key={slide.id}
            role="group"
          >
            {slide.categoryName ? (
              <p className="text-[11px] font-semibold tracking-[1.4px] text-white/75 uppercase">
                {slide.categoryName}
              </p>
            ) : null}

            {/*
              Stretched link: the ::after covers the whole positioned section, so
              the entire slide is clickable through to its product (§8a.0.5)
              without wrapping the prev/next buttons in an anchor, which would be
              invalid markup. The controls below sit above it on z-index.
            */}
            <p className="mt-1 font-display text-[22px] leading-tight font-bold sm:text-2xl">
              <Link
                className="after:absolute after:inset-0 after:z-10 hover:underline"
                href={`/product/${slide.slug}`}
              >
                {slide.name}
              </Link>
            </p>

            <p className="mt-2.5 flex items-baseline gap-2.5">
              <span className="font-display text-[26px] font-extrabold">
                {formatKES(slide.price)}
              </span>
              {hasDiscount ? (
                <span className="text-[15px] text-white/70 line-through">
                  {formatKES(slide.compareAtPrice as number)}
                </span>
              ) : null}
            </p>
          </div>
        ) : (
          <p className="max-w-[40ch] text-base opacity-95">
            Laptops, CCTV, networking, printers and accessories: real stock, fair prices, warranty
            backed.
          </p>
        )}

        <div className="relative z-20 mt-7 flex flex-wrap items-center gap-4">
          <Link
            className="inline-flex items-center gap-2 rounded-[10px] bg-white px-5 py-3.5 text-[15px] font-bold text-ink transition hover:shadow-lg"
            href="#featured"
          >
            Shop featured
          </Link>

          {count > 1 ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Previous product"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  onClick={goPrevious}
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" size={19} strokeWidth={2.4} />
                </button>
                <button
                  aria-label="Next product"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
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
                      at === active ? 'w-6 bg-white' : 'w-2 bg-white/45 hover:bg-white/75'
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
    </section>
  )
}
