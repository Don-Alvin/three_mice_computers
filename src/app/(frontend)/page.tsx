import React from 'react'

import { HeroCarousel } from '@/components/HeroCarousel'
import { ProductCard } from '@/components/ProductCard'
import { SectionHead } from '@/components/SectionHead'
import { getFeaturedProducts } from '@/lib/catalogue'
import {
  HERO_POOL_SIZE,
  HERO_SLIDE_COUNT,
  pickHeroProducts,
  rotationIndex,
  toHeroSlide,
} from '@/lib/hero'
import { jsonLdScript } from '@/lib/json-ld'
import { CONTACT, SITE_NAME } from '@/lib/site'

/** ISR, per plan §6. Also the period the hero rotation steps on (§8a.0.5). */
export const revalidate = 300

/**
 * Cards under the hero. Eight fills two clean rows of four on desktop; the pool
 * read for the carousel is larger and this slices it.
 */
const FEATURED_CARDS = 8

/*
 * CLIENT REVISION (plan §8a.0.2): the homepage is the hero then featured
 * products, nothing else. The category grid, brand strip, deals teaser and
 * trust row are commented out rather than deleted so they can be switched back
 * on. Their imports and queries were removed with them, so restoring a block
 * means restoring its import too:
 *
 *   - categories → `CategoryIcon` from '@/components/CategoryIcon', `getCategories`
 *   - brands     → `getBrands`
 *   - deals      → `getDealProducts`
 *   - trust row  → CreditCard, Truck, ShieldCheck, MessageCircle from 'lucide-react'
 *
 * Category and brand pages stay reachable from the header nav and the mobile
 * menu, so nothing is orphaned by this. `/deals` is the one route no longer
 * linked from anywhere; it still works when reached directly.
 */

export default async function HomePage() {
  // One query serves both the carousel pool and the grid: the pool needs more
  // rows than the grid shows so the rotation has something to rotate through.
  const featured = await getFeaturedProducts(HERO_POOL_SIZE)

  const slides = pickHeroProducts(featured, HERO_SLIDE_COUNT, rotationIndex(revalidate)).map(
    toHeroSlide,
  )

  const baseUrl = (process.env.NEXT_PUBLIC_SERVER_URL ?? '').replace(/\/+$/, '')

  /**
   * Site-wide JSON-LD, emitted once here rather than in the root layout: the
   * layout renders on every route (including `/cart`, which robots.ts already
   * excludes from crawling), and Organization/LocalBusiness/WebSite belong on
   * the page a crawler actually lands on for the brand (plan §9, launch
   * checklist Stage 2). `Product`/`BreadcrumbList` stay page-local (product,
   * category, brand).
   */
  const organizationLd = jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    ...(baseUrl ? { url: baseUrl, logo: `${baseUrl}/icon.svg` } : {}),
  })

  /**
   * `ElectronicsStore` (a schema.org subtype of LocalBusiness) rather than the
   * bare type: it is what the shop actually is, and Google's local-search
   * results weight the specific type. `address` is the plain-text form schema.org
   * allows (rather than a fabricated `PostalAddress` with fields the shop's
   * contact details don't carry) since `CONTACT.location` is the one string of
   * record (§4 of PROGRESS). `openingHoursSpecification` is the structured
   * encoding of `CONTACT.hours` ("Mon-Sat, 8am-6pm") — if that string ever
   * changes, this must change with it.
   */
  const localBusinessLd = jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'ElectronicsStore',
    name: SITE_NAME,
    telephone: CONTACT.phone,
    address: CONTACT.location,
    ...(baseUrl ? { url: baseUrl } : {}),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '18:00',
    },
  })

  /** Enables Google's sitelinks search box (launch checklist Stage 2). */
  const websiteLd = jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    ...(baseUrl
      ? {
          url: baseUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${baseUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }
      : {}),
  })

  return (
    <>
      <script type="application/ld+json">{organizationLd}</script>
      <script type="application/ld+json">{localBusinessLd}</script>
      <script type="application/ld+json">{websiteLd}</script>

      {/*
        ---- Hero (§8a.0.5) ----
        The carousel IS the hero: each slide's photo fills the whole panel and
        the proposition sits over it. The prototype's second hero button ("Order
        on WhatsApp") is not carried over - it was always inert, there is no
        site-wide chat handoff to point it at, and the real WhatsApp checkout
        lives on /cart (M6). A button that looks live and does nothing is worse
        than one button that works.
      */}
      <section className="wrap pt-3 pb-2">
        <HeroCarousel slides={slides} />
      </section>

      {/* ---- Featured: sourced from `featured: true` only (§8a.0.3) ---- */}
      <section className="wrap scroll-mt-28 py-5 pb-10" id="featured">
        <SectionHead href="/products" linkLabel="View all" title="Featured products" />
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 min-[720px]:grid-cols-3 lg:grid-cols-4">
            {featured.slice(0, FEATURED_CARDS).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No featured products yet.</p>
        )}
      </section>

      {/* ---- Categories: removed from the homepage per §8a.0.2 ----
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
      ---- */}

      {/* ---- Brands: removed from the homepage per §8a.0.2 ----
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
      ---- */}

      {/* ---- Hot deals: removed from the homepage per §8a.0.2 ----
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
      ---- */}

      {/* ---- Trust row: removed from the homepage per §8a.0.2 ----
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
      TRUST was: [
        { title: 'M-Pesa on WhatsApp', copy: 'Pay the way you like', Icon: CreditCard },
        { title: 'Fast delivery', copy: 'Countrywide dispatch', Icon: Truck },
        { title: 'Genuine & warranty', copy: 'Authorized stock', Icon: ShieldCheck },
        { title: 'WhatsApp support', copy: 'Chat before you buy', Icon: MessageCircle },
      ]
      ---- */}
    </>
  )
}
