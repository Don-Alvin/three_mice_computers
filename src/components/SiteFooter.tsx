import { SiFacebook, SiTiktok } from '@icons-pack/react-simple-icons'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { Brand, Category } from '../payload-types'

import { formatKenyaPhone } from '../lib/format'
import { CONTACT, SITE_DESCRIPTION, SITE_NAME } from '../lib/site'
import { isUsableWhatsAppNumber } from '../lib/whatsapp'
import { Logo } from './Logo'

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

/**
 * The shop's WhatsApp number, folded into the one phone line as `x / y` — both
 * numbers are callable, so this is one contact method with two lines, not two
 * separate ones. Read straight from the env var like `CheckoutAction` does,
 * not from `CONTACT`: it is deployment config, not site copy, and the two
 * numbers can legitimately differ. Guarded the same way checkout guards it: an
 * unset or malformed value falls back to the phone number alone.
 */
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

/**
 * Real social handles (plan §12a resolved). Facebook and TikTok are the only
 * two the client has — Instagram and the prototype's WhatsApp tile are not
 * rendered, matching §8a.1's rule that a social link must go somewhere real.
 */
const SOCIALS = [
  { name: 'Facebook', href: 'https://www.facebook.com/quadcommtech/', Icon: SiFacebook },
  { name: 'TikTok', href: 'https://www.tiktok.com/@3miceke', Icon: SiTiktok },
]

const iconProps = {
  size: 15,
  strokeWidth: 1.9,
  'aria-hidden': true,
  // White, not the red token: red at 15px on #141414 reads muddy next to the
  // white social tiles beside it.
  className: 'mt-0.5 shrink-0 text-white',
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
          {/* All-white on ink: the brand red does not hold enough contrast
              against #141414 to carry the wordmark (§12a logo, §8 tokens). */}
          <Logo className="h-10 w-auto" tone="light" />
          <span className="sr-only">{SITE_NAME}</span>
          <p className="my-3.5 max-w-[34ch] text-[13.5px] leading-relaxed text-[#9C9EA4]">
            {SITE_DESCRIPTION}
          </p>
          {/* 36px rounded tiles, bg rgba(255,255,255,.08), red on hover — the prototype's own `.socs` styling. */}
          <div className="flex gap-2.5">
            {SOCIALS.map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="grid h-9 w-9 place-items-center rounded-[9px] bg-white/[0.08] text-white transition hover:bg-red"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
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
          <ul className="flex flex-col gap-2.5 text-[13.5px] text-[#B4B6BB]">
            <li className="flex items-start gap-2.5">
              <CONTACT_ICONS.phone {...iconProps} />
              {isUsableWhatsAppNumber(WHATSAPP_NUMBER)
                ? `${CONTACT.phone} / ${formatKenyaPhone(WHATSAPP_NUMBER)}`
                : CONTACT.phone}
            </li>
            <li className="flex items-start gap-2.5">
              <CONTACT_ICONS.email {...iconProps} />
              {CONTACT.email}
            </li>
            <li className="flex items-start gap-2.5">
              <CONTACT_ICONS.location {...iconProps} />
              {CONTACT.location}
            </li>
            <li className="flex items-start gap-2.5">
              <CONTACT_ICONS.hours {...iconProps} />
              {CONTACT.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-3 border-t border-white/10 py-4.5 text-[12.5px] text-[#8A8C92]">
        <span>
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </span>
      </div>
    </div>
  </footer>
)
