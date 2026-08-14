import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { Brand, Category } from '../payload-types'

import { CONTACT_PLACEHOLDERS, SITE_DESCRIPTION, SITE_NAME } from '../lib/site'

/**
 * Contact-row icons (plan §8a.1). The prototype draws these as emoji; drawn as
 * Lucide icons here so they take the red token and render identically on every
 * platform, which emoji do not.
 */
const CONTACT_ICONS = {
  phone: Phone,
  email: Mail,
  location: MapPin,
  hours: Clock,
}

const iconProps = {
  size: 15,
  strokeWidth: 1.9,
  'aria-hidden': true,
  className: 'mt-0.5 shrink-0 text-red',
} as const

export const SiteFooter = ({
  categories,
  brands,
}: {
  categories: Category[]
  brands: Brand[]
}) => (
  <footer className="mt-2.5 bg-ink text-[#C9CACE]">
    <div className="wrap">
      <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
        <div>
          <span className="font-display text-xl font-extrabold text-white">{SITE_NAME}</span>
          <p className="my-3.5 max-w-[34ch] text-[13.5px] leading-relaxed text-[#9C9EA4]">
            {SITE_DESCRIPTION}
          </p>
          {/*
            The prototype's three social buttons are deliberately NOT rendered:
            the client's real Facebook/Instagram/WhatsApp handles are still an
            open input (plan §12a), and §8a.1 rules out social links that go
            nowhere. Add them here once the handles land — the prototype styles
            them as 36px rounded tiles, bg rgba(255,255,255,.08), red on hover.
          */}
        </div>

        <div>
          <h3 className="mb-4 font-display text-[15px] font-bold text-white">Popular categories</h3>
          <ul className="flex flex-col gap-2.5">
            {categories.slice(0, 5).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="text-[13.5px] text-[#B4B6BB] hover:text-white"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-[15px] font-bold text-white">Brands</h3>
          <ul className="flex flex-col gap-2.5">
            {brands.slice(0, 5).map((brand) => (
              <li key={brand.id}>
                <Link
                  href={`/brand/${brand.slug}`}
                  className="text-[13.5px] text-[#B4B6BB] hover:text-white"
                >
                  {brand.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-[15px] font-bold text-white">Get in touch</h3>
          {/* Placeholders — real details are a client input, collected before launch. */}
          <ul className="flex flex-col gap-2.5 text-[13.5px] text-[#B4B6BB]">
            <li className="flex items-start gap-2.5">
              <CONTACT_ICONS.phone {...iconProps} />
              {CONTACT_PLACEHOLDERS.phone}
            </li>
            <li className="flex items-start gap-2.5">
              <CONTACT_ICONS.email {...iconProps} />
              {CONTACT_PLACEHOLDERS.email}
            </li>
            <li className="flex items-start gap-2.5">
              <CONTACT_ICONS.location {...iconProps} />
              {CONTACT_PLACEHOLDERS.location}
            </li>
            <li className="flex items-start gap-2.5">
              <CONTACT_ICONS.hours {...iconProps} />
              {CONTACT_PLACEHOLDERS.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-3 border-t border-white/10 py-4.5 text-[12.5px] text-[#8A8C92]">
        <span>
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </span>
        <span>Contact details are placeholders pending launch.</span>
      </div>
    </div>
  </footer>
)
