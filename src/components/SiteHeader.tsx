import Link from 'next/link'
import React from 'react'

import type { Brand } from '../payload-types'

import type { CategoryGroup } from '../lib/nav'
import { ANNOUNCEMENTS, SITE_NAME, SITE_TAGLINE } from '../lib/site'
import { SearchForm } from './SearchForm'

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
    <div className="bg-ink text-[13px] text-white">
      <div className="wrap flex h-[38px] items-center justify-center gap-[22px] font-medium">
        {ANNOUNCEMENTS.map((text, index) => (
          <span
            key={text}
            className={`inline-flex items-center gap-2 whitespace-nowrap ${
              index > 0 ? 'hidden sm:inline-flex' : ''
            }`}
          >
            <i aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-red" />
            {text}
          </span>
        ))}
      </div>
    </div>

    <header className="sticky top-0 z-50 border-b border-line bg-surface">
      <div className="wrap flex flex-wrap items-center gap-3 py-3 menu:h-[74px] menu:flex-nowrap menu:gap-[22px] menu:py-0">
        <Link href="/" className="flex shrink-0 items-center gap-[11px]">
          {/* Placeholder wordmark until the client supplies a logo (§12a). */}
          <span
            aria-hidden="true"
            className="grid h-10 w-10 place-items-center rounded-[10px] bg-red font-display text-xl font-black text-white shadow-[0_4px_12px_rgba(225,17,40,.32)]"
          >
            ◈
          </span>
          <span className="font-display text-xl leading-none font-extrabold tracking-[-0.5px]">
            {SITE_NAME}
            <small className="mt-[3px] block font-body text-[10px] font-semibold tracking-[2px] text-text-muted uppercase">
              {SITE_TAGLINE}
            </small>
          </span>
        </Link>

        <SearchForm
          defaultValue={searchQuery}
          className="order-3 w-full menu:order-none menu:max-w-[560px] menu:flex-1"
        />

        <div className="ml-auto flex shrink-0 items-center gap-2 menu:ml-0">
          {/*
            Cart UI is Milestone 5. Rendered here so the header matches the
            approved prototype, but deliberately inert: /cart does not exist yet
            and a link would 404 during the client's M4 preview.
          */}
          <span
            className="relative flex flex-col items-center gap-[3px] rounded-[9px] px-2.5 py-1.5 text-[11px] font-semibold text-charcoal"
            aria-hidden="true"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="9" cy="20" r="1.6" />
              <circle cx="18" cy="20" r="1.6" />
              <path d="M2 3h3l2.4 12.5a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.2L22 7H6" />
            </svg>
            <span className="hidden menu:inline">Cart</span>
            <span className="absolute top-0 right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red px-1 text-[10px] font-bold text-white">
              0
            </span>
          </span>
        </div>
      </div>
    </header>

    <nav aria-label="Product categories" className="hidden bg-charcoal menu:block">
      <div className="wrap">
        <ul className="flex h-12 items-stretch gap-0.5">
          {groups.map((group) => (
            <li key={group.value} className="group relative flex items-center">
              <span className="flex h-full cursor-default items-center gap-[7px] px-4 text-sm font-semibold text-[#EDEDEE] transition-colors group-hover:bg-white/10">
                {group.label}
                <i aria-hidden="true" className="-mt-[3px] h-2 w-2 rotate-45 border-r-2 border-b-2 border-current opacity-60" />
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
              <i aria-hidden="true" className="-mt-[3px] h-2 w-2 rotate-45 border-r-2 border-b-2 border-current opacity-60" />
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

    <details className="border-b border-line bg-charcoal text-white menu:hidden">
      <summary className="wrap cursor-pointer py-3 text-sm font-semibold">
        Browse categories &amp; brands
      </summary>
      <div className="wrap pb-4">
        {groups.map((group) => (
          <div key={group.value} className="py-2">
            <p className="py-1.5 text-[11px] font-bold tracking-[1px] text-[#FFC9CF] uppercase">
              {group.label}
            </p>
            {group.categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="block py-2 text-sm text-[#EDEDEE]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        ))}
        <div className="py-2">
          <p className="py-1.5 text-[11px] font-bold tracking-[1px] text-[#FFC9CF] uppercase">
            Shop by Brand
          </p>
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}`}
              className="block py-2 text-sm text-[#EDEDEE]"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </details>
  </>
)
