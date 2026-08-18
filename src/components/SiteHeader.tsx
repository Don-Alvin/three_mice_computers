import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { Brand } from '../payload-types'

import type { CategoryGroup } from '../lib/nav'
import { ANNOUNCEMENTS, SITE_NAME, SITE_TAGLINE } from '../lib/site'
import { CartButton } from './cart/CartButton'
import { MobileNav } from './MobileNav'
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

        <div className="ml-auto flex shrink-0 items-center gap-1 menu:ml-0">
          {/* The only client components in the header — the rest stays server-rendered. */}
          <MobileNav groups={groups} brands={brands} />
          <CartButton />
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
                <ChevronDown aria-hidden="true" size={14} strokeWidth={2.4} className="opacity-60" />
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
