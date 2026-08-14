import { CreditCard, MessageCircle, ShieldCheck, Truck } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { CategoryIcon } from '@/components/CategoryIcon'
import { ProductCard } from '@/components/ProductCard'
import { SectionHead } from '@/components/SectionHead'
import { getBrands, getCategories, getDealProducts, getFeaturedProducts } from '@/lib/catalogue'

/** ISR, per plan §6. */
export const revalidate = 300

/**
 * Trust row. One icon per item, matching the prototype's four glyphs (card,
 * van, shield, chat) — not the same glyph four times. The first item's copy
 * keeps the §8a reword: no card claim in Phase 1, even though the prototype's
 * icon for that slot is a card.
 */
const TRUST = [
  { title: 'M-Pesa on WhatsApp', copy: 'Pay the way you like', Icon: CreditCard },
  { title: 'Fast delivery', copy: 'Countrywide dispatch', Icon: Truck },
  { title: 'Genuine & warranty', copy: 'Authorized stock', Icon: ShieldCheck },
  { title: 'WhatsApp support', copy: 'Chat before you buy', Icon: MessageCircle },
]

export default async function HomePage() {
  const [categories, brands, featured, deals] = await Promise.all([
    getCategories(),
    getBrands(),
    getFeaturedProducts(8),
    getDealProducts(4),
  ])

  return (
    <>
      {/* ---- Hero ---- */}
      <section className="wrap grid gap-4 pt-7 pb-2 lg:grid-cols-[2fr_1fr]">
        <div className="relative flex min-h-[300px] flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-red to-red-dark px-6 py-11 text-white sm:px-10">
          <span
            aria-hidden="true"
            className="absolute -top-15 -right-15 h-70 w-70 rounded-full bg-white/10"
          />
          <p className="mb-3.5 text-xs font-bold tracking-[2px] uppercase opacity-90">
            Trusted computer store
          </p>
          <h1 className="mb-3.5 max-w-[15ch] font-display text-[clamp(28px,4vw,46px)] leading-[1.04] font-extrabold tracking-[-1px]">
            Genuine tech, delivered across Kenya.
          </h1>
          <p className="mb-6 max-w-[40ch] text-base opacity-95">
            Laptops, CCTV, networking, printers and accessories — real stock, fair prices, warranty
            backed.
          </p>
          <div className="relative z-10 flex flex-wrap gap-3">
            <Link
              href="#featured"
              className="inline-flex items-center gap-2 rounded-[10px] bg-white px-5 py-3.5 text-[15px] font-bold text-ink transition hover:shadow-lg"
            >
              Shop featured
            </Link>
            {/*
              WhatsApp ordering is Milestone 6, and the real business number is
              still an open client input (§12a). Rendered for the approved
              layout but inert — linking a placeholder number would open a chat
              to nobody. See summary.
            */}
            <span
              aria-hidden="true"
              className="inline-flex items-center gap-2 rounded-[10px] bg-wa px-5 py-3.5 text-[15px] font-bold text-wa-ink"
            >
              Order on WhatsApp
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Link
            href="/category/cctv-cameras"
            className="flex min-h-[142px] flex-col justify-between rounded-2xl bg-gradient-to-br from-charcoal to-[#333] p-6 text-white transition hover:-translate-y-0.5"
          >
            <span>
              <span className="block font-display text-xl leading-tight font-bold">
                CCTV &amp; Surveillance
              </span>
              <span className="mt-1 block text-[13px] opacity-85">Cameras, storage &amp; kits</span>
            </span>
            <span className="mt-3.5 text-[13px] font-bold">Shop now →</span>
          </Link>

          <Link
            href="/category/laptops"
            className="flex min-h-[142px] flex-col justify-between rounded-2xl bg-gradient-to-br from-[#0E3A5F] to-[#14618A] p-6 text-white transition hover:-translate-y-0.5"
          >
            <span>
              <span className="block font-display text-xl leading-tight font-bold">
                Laptops &amp; Desktops
              </span>
              <span className="mt-1 block text-[13px] opacity-85">HP · Dell · Lenovo</span>
            </span>
            <span className="mt-3.5 text-[13px] font-bold">Shop now →</span>
          </Link>
        </div>
      </section>

      {/* ---- Categories ---- */}
      {/*
        "All categories →" anchors back to this grid rather than to a separate
        index page: the grid already lists all 21 categories (plan §8a.1).
      */}
      <section id="categories" className="wrap scroll-mt-28 py-8">
        <SectionHead title="Shop by category" href="/#categories" linkLabel="All categories" />
        <div className="grid grid-cols-2 gap-3 min-[560px]:grid-cols-4 lg:grid-cols-7">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="flex flex-col items-center gap-2.5 rounded-xl border border-line bg-surface px-2.5 py-4.5 text-center transition hover:-translate-y-0.5 hover:border-red hover:shadow-card"
            >
              <span className="grid h-[46px] w-[46px] place-items-center rounded-xl bg-red-soft text-red">
                <CategoryIcon slug={category.slug} />
              </span>
              <span className="text-[12.5px] leading-tight font-semibold text-charcoal">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Featured ---- */}
      <section id="featured" className="wrap scroll-mt-28 py-2 pb-8">
        <SectionHead title="Featured products" href="/products" linkLabel="View all" />
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 min-[720px]:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No featured products yet.</p>
        )}
      </section>

      {/* ---- Brands ---- */}
      {/* "All brands →" anchors here for the same reason as the category grid. */}
      <section id="brands" className="wrap scroll-mt-28 py-2 pb-8">
        <SectionHead title="Shop by brand" href="/#brands" linkLabel="All brands" />
        <div className="grid grid-cols-3 gap-3 min-[520px]:grid-cols-5 lg:grid-cols-10">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}`}
              className="grid h-[74px] place-items-center rounded-xl border border-line bg-surface font-display text-base font-extrabold tracking-[-0.3px] text-charcoal transition hover:-translate-y-0.5 hover:border-red hover:text-red"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Deals: products with a compare-at price (plan §8a) ---- */}
      {deals.length > 0 ? (
        <section className="wrap py-2 pb-8">
          <SectionHead title="Hot deals" href="/deals" linkLabel="See all offers" />
          <div className="grid grid-cols-2 gap-4 min-[720px]:grid-cols-3 lg:grid-cols-4">
            {deals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ---- Trust ---- */}
      <div className="border-y border-line bg-surface">
        <div className="wrap grid gap-5 py-6.5 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((item) => (
            <div key={item.title} className="flex items-center gap-3.5">
              <span
                aria-hidden="true"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[11px] bg-red-soft text-red"
              >
                <item.Icon size={22} strokeWidth={1.8} />
              </span>
              <div>
                <b className="block text-sm text-charcoal">{item.title}</b>
                <small className="text-[12.5px] text-text-muted">{item.copy}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
