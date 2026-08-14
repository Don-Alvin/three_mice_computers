import config from '@payload-config'
import { getPayload } from 'payload'
import sharp from 'sharp'

import type { Product } from '../payload-types'

import { formatSlug } from '../fields/slug'

/**
 * Seeds the 21 categories, 10 brands and a set of dummy products from the
 * approved prototype (plan §10, milestone 2).
 *
 * This script only ever CREATES. Records are matched on their natural key
 * (category/brand name, product slug) and any that already exist are left
 * completely untouched — never updated, never overwritten.
 *
 * That distinction matters once the catalogue is real. Sending a full `data`
 * object to `payload.update()` replaces array fields wholesale, so re-seeding
 * would wipe an editor's uploaded product photos, description, specs and tags
 * and restore the placeholder image and this file's invented copy. "Does not
 * duplicate rows" is not the same guarantee as "does not destroy content".
 *
 * Consequence to be aware of: editing the seed data below will NOT propagate to
 * a database that has already been seeded. Fix such records in the admin panel.
 *
 * The other route — reset the database and seed again — is
 * `pnpm payload migrate:fresh --force-accept-warning`, and it is ONLY for a
 * disposable local database. It drops every table, and the flag deliberately
 * suppresses the confirmation prompt that would otherwise stop you. NEVER run it
 * against production, a preview environment, or any database holding curated
 * content: it destroys precisely the photos and copy this script goes out of its
 * way not to touch.
 *
 * Deliberately does NOT create an admin user. The first admin is created
 * through Payload's own first-run screen at /admin so no password is ever
 * written into this repo.
 *
 * Run with:  pnpm seed
 */

type CategorySeed = {
  name: string
  group: 'computing' | 'storage' | 'networking-cctv' | 'accessories' | 'cables-power'
}

const categories: CategorySeed[] = [
  { name: 'Laptops', group: 'computing' },
  { name: 'Desktops', group: 'computing' },
  { name: 'Monitors', group: 'computing' },
  { name: 'Printers', group: 'computing' },

  { name: 'External Hardisks', group: 'storage' },
  { name: 'Internal Hardisks', group: 'storage' },
  { name: 'Surveillance Hardisks', group: 'storage' },
  { name: 'Flash Disks', group: 'storage' },

  { name: 'CCTV Cameras', group: 'networking-cctv' },
  { name: 'CAT 6 LAN Cables', group: 'networking-cctv' },
  { name: 'Outdoor CAT 6 LAN Cables', group: 'networking-cctv' },
  { name: 'Computer Hubs', group: 'networking-cctv' },

  { name: 'Mouse', group: 'accessories' },
  { name: 'Keyboards', group: 'accessories' },
  { name: 'Multimedia Speakers', group: 'accessories' },
  { name: 'Bluetooth Speakers', group: 'accessories' },
  { name: 'Computer Blower', group: 'accessories' },
  { name: 'Toner Cartridges', group: 'accessories' },

  { name: 'HDMI Cables', group: 'cables-power' },
  { name: 'Extension Cables', group: 'cables-power' },
  { name: 'UPS', group: 'cables-power' },
]

/**
 * Curated merchandising order, matching the approved prototype's brand strip
 * (plan §4). Array position becomes `brands.order`, so keep them in this order.
 */
const brands = ['HP', 'Dell', 'Lenovo', 'Epson', 'Havit', 'Anker', 'Ugreen', 'UNV', 'Amaya', 'Asta']

type ProductSeed = {
  name: string
  category: string
  brand: string
  price: number
  compareAtPrice?: number
  stockStatus?: Product['stockStatus']
  badge?: Product['badge']
  featured?: boolean
  description: string
  specs?: { label: string; value: string }[]
  tags?: string[]
}

/** Mirrors the placeholder catalogue in shop-ui-prototype.html. */
const products: ProductSeed[] = [
  {
    name: 'HP EliteBook 840 G8 Laptop',
    category: 'Laptops',
    brand: 'HP',
    price: 85000,
    badge: 'hot',
    featured: true,
    description:
      'Business-class 14" ultrabook with a backlit keyboard and all-day battery. Ideal for office and field work.',
    specs: [
      { label: 'Processor', value: 'Intel Core i5-1135G7' },
      { label: 'RAM', value: '16 GB DDR4' },
      { label: 'Storage', value: '512 GB NVMe SSD' },
      { label: 'Display', value: '14" Full HD IPS' },
    ],
    tags: ['business', 'ultrabook'],
  },
  {
    name: 'Dell OptiPlex 3090 Desktop',
    category: 'Desktops',
    brand: 'Dell',
    price: 62000,
    description:
      'Compact desktop tower built for reliability in busy offices. Ships ready for a dual-monitor setup.',
    specs: [
      { label: 'Processor', value: 'Intel Core i5-10500T' },
      { label: 'RAM', value: '8 GB DDR4' },
      { label: 'Storage', value: '256 GB SSD' },
    ],
    tags: ['office'],
  },
  {
    name: 'Dell 24" P2422H IPS Monitor',
    category: 'Monitors',
    brand: 'Dell',
    price: 28500,
    badge: 'hot',
    featured: true,
    description:
      'Full HD IPS panel with a height-adjustable stand and thin bezels — comfortable for long working days.',
    specs: [
      { label: 'Size', value: '24 inches' },
      { label: 'Resolution', value: '1920 x 1080' },
      { label: 'Panel', value: 'IPS, 60 Hz' },
      { label: 'Ports', value: 'HDMI, DisplayPort, VGA' },
    ],
  },
  {
    name: 'Epson EcoTank L3250 Printer',
    category: 'Printers',
    brand: 'Epson',
    price: 32000,
    stockStatus: 'on-order',
    description:
      'Refillable ink tank all-in-one with Wi-Fi. Very low running cost per page compared to cartridge printers.',
    specs: [
      { label: 'Functions', value: 'Print, scan, copy' },
      { label: 'Connectivity', value: 'Wi-Fi, USB' },
    ],
    tags: ['ink tank'],
  },
  {
    name: 'UNV 4MP Dome CCTV Camera',
    category: 'CCTV Cameras',
    brand: 'UNV',
    price: 5400,
    badge: 'hot',
    featured: true,
    description:
      'Indoor/outdoor dome camera with night vision and a weatherproof housing. Pairs with any UNV NVR.',
    specs: [
      { label: 'Resolution', value: '4 MP' },
      { label: 'Night vision', value: 'Up to 30 m' },
      { label: 'Rating', value: 'IP67 weatherproof' },
    ],
    tags: ['surveillance', 'security'],
  },
  {
    name: 'Ugreen HDMI 2.0 Cable 2m',
    category: 'HDMI Cables',
    brand: 'Ugreen',
    price: 850,
    description:
      'Braided HDMI 2.0 cable supporting 4K at 60 Hz. Gold-plated connectors resist corrosion.',
    specs: [
      { label: 'Length', value: '2 metres' },
      { label: 'Supports', value: '4K @ 60 Hz' },
    ],
  },
  {
    name: 'Amaya 650VA Line UPS',
    category: 'UPS',
    brand: 'Amaya',
    price: 7800,
    stockStatus: 'out-of-stock',
    description:
      'Keeps a desktop and router running through short outages, giving you time to save work and shut down safely.',
    specs: [
      { label: 'Capacity', value: '650 VA' },
      { label: 'Outlets', value: '3 surge-protected' },
    ],
    tags: ['power backup'],
  },
  {
    name: 'HP 05A Black Toner Cartridge',
    category: 'Toner Cartridges',
    brand: 'HP',
    price: 6800,
    description: 'Genuine HP 05A black toner for LaserJet P2035 and P2055 series printers.',
    specs: [
      { label: 'Yield', value: 'approx. 2,300 pages' },
      { label: 'Colour', value: 'Black' },
    ],
  },
  {
    name: 'Anker Soundcore BT Speaker',
    category: 'Bluetooth Speakers',
    brand: 'Anker',
    price: 6500,
    compareAtPrice: 7900,
    description:
      'Portable Bluetooth speaker with 24-hour playtime and deep bass for its size. Splash resistant.',
    specs: [
      { label: 'Battery', value: 'Up to 24 hours' },
      { label: 'Connectivity', value: 'Bluetooth 5.0, AUX' },
    ],
    tags: ['portable'],
  },
  {
    name: 'Havit HV-SK473 Speakers',
    category: 'Multimedia Speakers',
    brand: 'Havit',
    price: 3200,
    compareAtPrice: 3900,
    description: 'Compact USB-powered 2.0 desktop speakers with an inline volume control.',
    specs: [
      { label: 'Power', value: 'USB powered' },
      { label: 'Configuration', value: '2.0 stereo' },
    ],
  },
  {
    name: 'Lenovo V15 G4 Laptop',
    category: 'Laptops',
    brand: 'Lenovo',
    price: 54000,
    compareAtPrice: 59000,
    description:
      'Affordable 15.6" laptop for study and everyday office work, with a full-size number pad.',
    specs: [
      { label: 'Processor', value: 'AMD Ryzen 5 7520U' },
      { label: 'RAM', value: '8 GB' },
      { label: 'Storage', value: '512 GB SSD' },
      { label: 'Display', value: '15.6" Full HD' },
    ],
    tags: ['student', 'budget'],
  },
  {
    name: 'Ugreen 4-Port USB 3.0 Hub',
    category: 'Computer Hubs',
    brand: 'Ugreen',
    price: 1900,
    compareAtPrice: 2400,
    description: 'Adds four USB 3.0 ports to a laptop or desktop. No drivers needed.',
    specs: [
      { label: 'Ports', value: '4 x USB 3.0' },
      { label: 'Cable', value: '0.5 m' },
    ],
  },
]

type RichText = NonNullable<Product['description']>

/** Minimal valid Lexical document — one paragraph of plain text. */
const richText = (text: string): RichText => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
      },
    ],
  },
})

const seed = async (): Promise<void> => {
  const payload = await getPayload({ config })

  // ---- Placeholder image -------------------------------------------------
  // Products require at least one image. Rather than commit a binary asset,
  // synthesise a neutral placeholder once and reuse it for every dummy product.
  const placeholderAlt = 'Placeholder product image'

  const existingMedia = await payload.find({
    collection: 'media',
    where: { alt: { equals: placeholderAlt } },
    limit: 1,
    depth: 0,
  })

  let placeholderId: number

  if (existingMedia.docs.length > 0) {
    placeholderId = existingMedia.docs[0].id
    payload.logger.info('Placeholder image already present — reusing it.')
  } else {
    const buffer = await sharp({
      create: {
        width: 1200,
        height: 1200,
        channels: 3,
        background: { r: 244, g: 245, b: 247 },
      },
    })
      .png()
      .toBuffer()

    const created = await payload.create({
      collection: 'media',
      data: { alt: placeholderAlt },
      file: {
        data: buffer,
        mimetype: 'image/png',
        name: 'placeholder-product.png',
        size: buffer.length,
      },
    })

    placeholderId = created.id
    payload.logger.info('Created placeholder product image.')
  }

  // ---- Categories --------------------------------------------------------
  const categoryIds = new Map<string, number>()
  let categoriesCreated = 0

  for (const [index, category] of categories.entries()) {
    const existing = await payload.find({
      collection: 'categories',
      where: { name: { equals: category.name } },
      limit: 1,
      depth: 0,
    })

    // `order`, `image` and the SEO fields are editor-owned once the shop is
    // live — re-seeding must not undo a manual reordering.
    if (existing.docs.length > 0) {
      categoryIds.set(category.name, existing.docs[0].id)
      continue
    }

    const created = await payload.create({
      collection: 'categories',
      data: {
        name: category.name,
        slug: formatSlug(category.name),
        group: category.group,
        order: (index + 1) * 10,
      },
    })

    categoryIds.set(category.name, created.id)
    categoriesCreated += 1
  }

  payload.logger.info(
    `Categories: ${categoriesCreated} created, ${categoryIds.size - categoriesCreated} already present (untouched).`,
  )

  // ---- Brands ------------------------------------------------------------
  const brandIds = new Map<string, number>()
  let brandsCreated = 0

  for (const [index, name] of brands.entries()) {
    const existing = await payload.find({
      collection: 'brands',
      where: { name: { equals: name } },
      limit: 1,
      depth: 0,
    })

    // Leaves an uploaded brand logo — and any curated `order` — alone.
    if (existing.docs.length > 0) {
      brandIds.set(name, existing.docs[0].id)
      continue
    }

    // `order` is set on create only. Brands seeded before the field existed keep
    // order 0 and are sorted alphabetically until an editor sets them in admin.
    const created = await payload.create({
      collection: 'brands',
      data: { name, slug: formatSlug(name), order: index },
    })

    brandIds.set(name, created.id)
    brandsCreated += 1
  }

  payload.logger.info(
    `Brands: ${brandsCreated} created, ${brandIds.size - brandsCreated} already present (untouched).`,
  )

  // ---- Products ----------------------------------------------------------
  let productsCreated = 0
  let productsExisting = 0

  for (const product of products) {
    const categoryId = categoryIds.get(product.category)
    const brandId = brandIds.get(product.brand)

    if (categoryId === undefined || brandId === undefined) {
      payload.logger.warn(
        `Skipping "${product.name}" — unknown category "${product.category}" or brand "${product.brand}".`,
      )
      continue
    }

    const slug = formatSlug(product.name)

    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })

    // The single most destructive thing this script could do is overwrite a
    // product an editor has curated. Once it exists, it is theirs.
    if (existing.docs.length > 0) {
      productsExisting += 1
      continue
    }

    await payload.create({
      collection: 'products',
      data: {
        name: product.name,
        slug,
        description: richText(product.description),
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? null,
        images: [{ image: placeholderId }],
        category: categoryId,
        brand: brandId,
        specs: product.specs ?? [],
        stockStatus: product.stockStatus ?? ('in-stock' as const),
        badge: product.badge ?? ('none' as const),
        featured: product.featured ?? false,
        published: true,
        tags: product.tags ?? [],
      },
    })

    productsCreated += 1
  }

  payload.logger.info(
    `Products: ${productsCreated} created, ${productsExisting} already present (untouched).`,
  )
  payload.logger.info('Seed complete.')
}

await seed()

process.exit(0)
