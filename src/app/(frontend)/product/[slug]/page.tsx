import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import type { Product } from '@/payload-types'

import { getProductBySlug } from '@/lib/catalogue'
import { discountPercent, formatKES } from '@/lib/format'
import { resolveImage } from '@/lib/media'
import { lexicalToPlainText } from '@/lib/richtext'

export const revalidate = 300

const STOCK: Record<Product['stockStatus'], { label: string; className: string }> = {
  'in-stock': { label: 'In stock', className: 'bg-ok/10 text-ok' },
  'out-of-stock': { label: 'Out of stock', className: 'bg-ink/10 text-ink' },
  'on-order': { label: 'Available on order', className: 'bg-red-soft text-red-dark' },
}

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return { title: 'Product not found' }
  }

  const image = resolveImage(product.images?.[0]?.image, 'full')
  const description = lexicalToPlainText(product.description) || `${product.name} — available now.`

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: image ? [{ url: image.url, width: image.width, height: image.height }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const images = (product.images ?? [])
    .map((entry) => resolveImage(entry.image, 'full'))
    .filter((image): image is NonNullable<typeof image> => image !== null)

  const [primary, ...rest] = images
  const category = typeof product.category === 'object' ? product.category : null
  const brand = typeof product.brand === 'object' ? product.brand : null
  const stock = STOCK[product.stockStatus]
  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price)

  return (
    <div className="wrap py-8">
      <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-text-muted">
        <Link href="/" className="hover:text-red">
          Home
        </Link>
        {category ? (
          <>
            <span aria-hidden="true"> / </span>
            <Link href={`/category/${category.slug}`} className="hover:text-red">
              {category.name}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ---- Gallery ---- */}
        <div>
          <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl border border-line bg-surface">
            {primary ? (
              <Image
                src={primary.url}
                alt={primary.alt}
                width={primary.width}
                height={primary.height}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-xs font-semibold tracking-[1px] text-[#B9BBC0] uppercase">
                No photo yet
              </span>
            )}
          </div>

          {/*
            Static thumbnail strip. Click-to-switch needs a client component;
            deferred rather than shipped half-working. See summary.
          */}
          {rest.length > 0 ? (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((image, index) => (
                <div
                  key={`${image.url}-${index}`}
                  className="grid aspect-square place-items-center overflow-hidden rounded-lg border border-line bg-surface"
                >
                  <Image
                    src={image.url}
                    alt=""
                    width={image.width}
                    height={image.height}
                    sizes="120px"
                    className="h-full w-full object-contain"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* ---- Detail ---- */}
        <div>
          {brand ? (
            <Link
              href={`/brand/${brand.slug}`}
              className="text-[11px] font-semibold tracking-[0.4px] text-red uppercase hover:underline"
            >
              {brand.name}
            </Link>
          ) : null}

          <h1 className="mt-1.5 font-display text-3xl leading-tight font-extrabold tracking-[-0.5px]">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl font-extrabold text-ink">
              {formatKES(product.price)}
            </span>
            {hasDiscount ? (
              <>
                <span className="text-base text-text-muted line-through">
                  {formatKES(product.compareAtPrice as number)}
                </span>
                <span className="rounded-md bg-ink px-2 py-1 text-[11px] font-extrabold text-white">
                  Save {discountPercent(product.price, product.compareAtPrice as number)}%
                </span>
              </>
            ) : null}
          </div>

          <p
            className={`mt-3 inline-block rounded-md px-2.5 py-1 text-[12px] font-semibold ${stock.className}`}
          >
            {stock.label}
          </p>

          {/*
            Add-to-cart is Milestone 5 — no cart store exists yet. Rendered for
            the approved layout but inert.
          */}
          <span
            aria-hidden="true"
            className="mt-6 flex w-full max-w-sm items-center justify-center gap-2 rounded-[11px] bg-ink px-4 py-3.5 text-[15px] font-bold text-white"
          >
            Add to cart
          </span>

          {product.description ? (
            <div className="mt-8 max-w-[60ch] text-[15px] leading-relaxed text-charcoal [&_a]:text-red [&_a]:underline [&_p]:mb-3">
              {/* Payload's JSX serializer — never dangerouslySetInnerHTML (§5.3). */}
              <RichText data={product.description as SerializedEditorState} />
            </div>
          ) : null}

          {product.specs && product.specs.length > 0 ? (
            <section className="mt-8">
              <h2 className="mb-3 font-display text-lg font-bold">Specifications</h2>
              <dl className="overflow-hidden rounded-xl border border-line bg-surface">
                {product.specs.map((spec, index) => (
                  <div
                    key={spec.id ?? `${spec.label}-${index}`}
                    className={`flex gap-4 px-4 py-3 text-sm ${
                      index > 0 ? 'border-t border-line' : ''
                    }`}
                  >
                    <dt className="w-40 shrink-0 font-semibold text-text-muted">{spec.label}</dt>
                    <dd className="text-charcoal">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
