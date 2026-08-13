import Link from 'next/link'
import React from 'react'

import type { Brand, Category } from '../payload-types'

import { CONTACT_PLACEHOLDERS, SITE_DESCRIPTION, SITE_NAME } from '../lib/site'

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
            <li>{CONTACT_PLACEHOLDERS.phone}</li>
            <li>{CONTACT_PLACEHOLDERS.email}</li>
            <li>{CONTACT_PLACEHOLDERS.location}</li>
            <li>{CONTACT_PLACEHOLDERS.hours}</li>
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
