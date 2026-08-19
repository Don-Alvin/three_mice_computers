import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { Brand } from '../payload-types'

import type { CategoryGroup } from '../lib/nav'
import { ANNOUNCEMENTS, SITE_NAME } from '../lib/site'
import { CartButton } from './cart/CartButton'
import { Logo } from './Logo'
import { MobileNav } from './MobileNav'
import { SearchForm } from './SearchForm'

/**
 * One pass of the announcement list. The bar scrolls, so the list is rendered
 * several times over: a marquee needs enough copies to cover the widest viewport
 * plus one full pass, or a gap opens up at the end of each cycle on wide screens.
 * Only the first pass is exposed to assistive tech; the rest are decoration.
 */
const AnnouncementRun = ({ duplicate = false }: { duplicate?: boolean }) => (
  <div
    aria-hidden={duplicate || undefined}
    className={`flex shrink-0 items-center gap-[22px] pr-[22px] ${
      duplicate ? 'motion-reduce:hidden' : ''
    }`}
  >
    {ANNOUNCEMENTS.map((text) => (
      <span className="inline-flex items-center gap-2 whitespace-nowrap" key={text}>
        <i aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-red" />
        {text}
      </span>
    ))}
  </div>
)

/**
 * Header, announcement bar and category navigation.
 *
 * The prototype's "Account" button is deliberately absent — Phase 1 has no
 * customer accounts, and a dead Account button promises what the site cannot do
 * (plan §8a ruling). The admin signs in at /admin, which is not customer-facing.
 *
 * The desktop mega-menu is pure CSS (group-hover), exactly as prototyped, so the
 * whole header stays a server component. Below 900px the category bar is
 * replaced by a native <details> accordion, which needs no JavaScript either;
 * the richer mobile drawer is M7 polish.
 */
export const SiteHeader = ({
  groups,
  brands,
  searchQuery,
}: {
  groups: CategoryGroup[]
  brands: Brand[]
  searchQuery?: string
}) => (
  <>
    {/*
      The announcements scroll rather than sit fixed. Fixed, the row had to hide
      every item after the first below 640px to stop the bar overflowing, so on a
      phone the shop silently lost half its own messaging. Scrolling shows all of
      them at any width without the bar ever having to grow or clip.

      Under prefers-reduced-motion the duplicate passes are hidden and the single
      real one centres itself, which is the old static bar back again - a moving
      strip of text is exactly what that preference is asking us not to do.
    */}
    <div className="overflow-hidden bg-ink text-[13px] font-medium text-white">
      <div className="flex h-[38px] w-max animate-marquee items-center hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:justify-center">
        <AnnouncementRun />
        <AnnouncementRun duplicate />
        <AnnouncementRun duplicate />
        <AnnouncementRun duplicate />
      </div>
    </div>

    <header className="sticky top-0 z-50 border-b border-line bg-surface">
      <div className="wrap flex flex-wrap items-center gap-3 py-3 menu:h-[74px] menu:flex-nowrap menu:gap-[22px] menu:py-0">
        {/*
          The logo is the whole lockup: it already carries both the mark and the
          word "COMPUTERS", so neither a site-name text node nor the tagline is
          set beside it. Two spellings of the shop's name in one lockup is worse
          than none, and the tagline set under a compact mark rendered about two
          and a half times the logo's own width, which read as a caption rather
          than a wordmark. SITE_TAGLINE still does its work in the page title.

          NOTE (plan §12a, open client input): the logo reads "3M COMPUTERS"
          while SITE_NAME is still "Three Mice Computers", so what a sighted
          visitor reads and what a screen reader announces do not match yet.
          Confirming the customer-facing name resolves it in one edit to
          `lib/site.ts` - nothing here needs to change.
        */}
        <Link aria-label={SITE_NAME} className="flex shrink-0 items-center" href="/">
          <Logo className="h-13 w-auto" />
        </Link>

        {/*
          Search and cart sit together on the right on desktop, not beside the
          logo. `menu:ml-auto` on the search does the pushing and the cart group
          follows it, so the row reads logo | gap | search + cart. The width is a
          percentage rather than `flex-1` so the gap survives on wide screens
          instead of the search stretching to swallow it.
        */}
        <SearchForm
          defaultValue={searchQuery}
          className="order-3 w-full menu:order-none menu:ml-auto menu:w-[42%] menu:max-w-[520px] menu:min-w-[240px]"
        />

        <div className="ml-auto flex shrink-0 items-center gap-1 menu:ml-0">
          {/* The only client components in the header — the rest stays server-rendered. */}
          <MobileNav groups={groups} brands={brands} />
          <CartButton />
        </div>
      </div>
    </header>

    <nav aria-label="Product categories" className="hidden bg-charcoal menu:block">
      <div className="wrap">
        {/* Centred: the six groups are narrower than the wrap on a large screen
            and read as abandoned in the left corner when flush-left. */}
        <ul className="flex h-12 items-stretch justify-center gap-0.5">
          {groups.map((group) => (
            <li key={group.value} className="group relative flex items-center">
              <span className="flex h-full cursor-default items-center gap-[7px] px-4 text-sm font-semibold text-[#EDEDEE] transition-colors group-hover:bg-white/10">
                {group.label}
                <ChevronDown
                  aria-hidden="true"
                  size={14}
                  strokeWidth={2.4}
                  className="opacity-60"
                />
              </span>
              <div className="invisible absolute top-full left-0 z-40 min-w-[240px] translate-y-1.5 rounded-b-xl bg-white p-2 opacity-0 shadow-card transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {group.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-red-soft hover:text-red-dark"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </li>
          ))}

          <li className="group relative flex items-center">
            <span className="flex h-full cursor-default items-center gap-[7px] px-4 text-sm font-semibold text-[#FFC9CF] transition-colors group-hover:bg-white/10">
              Shop by Brand
              <ChevronDown aria-hidden="true" size={14} strokeWidth={2.4} className="opacity-60" />
            </span>
            <div className="invisible absolute top-full left-0 z-40 min-w-[240px] translate-y-1.5 rounded-b-xl bg-white p-2 opacity-0 shadow-card transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.slug}`}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-red-soft hover:text-red-dark"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </li>
        </ul>
      </div>
    </nav>

    {/*
      M4's `<details>` accordion lived here as an explicit interim. It is now the
      prototype's proper slide-out drawer, rendered by `MobileNav` alongside the
      hamburger above (§8a.2 — the mobile menu has an approved reference).
    */}
  </>
)
