import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '../access'
import { slugField } from '../fields/slug'

/**
 * Prices are KES integers throughout (plan §14) — no cents, ever. Enforced here
 * rather than only in the display layer, because a fractional price would reach
 * the customer through the WhatsApp order message.
 */
const wholeShillings =
  (label: string, { optional = false }: { optional?: boolean } = {}) =>
  (value: number | number[] | null | undefined): string | true => {
    if (value === null || value === undefined || (value as unknown) === '') {
      return optional ? true : `${label} is required.`
    }

    if (Array.isArray(value)) {
      return `${label} must be a single number.`
    }

    if (!Number.isInteger(value)) {
      return `${label} must be a whole number of shillings — no decimals.`
    }

    if (value < 0) {
      return `${label} cannot be negative.`
    }

    return true
  }

export const stockStatusOptions = [
  { label: 'In stock', value: 'in-stock' },
  { label: 'Out of stock', value: 'out-of-stock' },
  { label: 'On order', value: 'on-order' },
]

/**
 * Drives the product-card corner flag from the prototype (plan §4, §8a).
 * One field rather than several booleans, so two flags can never conflict.
 */
export const badgeOptions = [
  { label: 'None', value: 'none' },
  { label: 'Hot', value: 'hot' },
  { label: 'Deal', value: 'deal' },
]

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'brand', 'price', 'stockStatus', 'published'],
    group: 'Catalogue',
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      validate: wholeShillings('Price'),
      admin: {
        step: 1,
        description: 'KES, whole shillings.',
      },
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      validate: wholeShillings('Compare-at price', { optional: true }),
      admin: {
        step: 1,
        description: 'Optional. The old price, shown struck through. Leave blank if not discounted.',
      },
    },
    {
      name: 'images',
      type: 'array',
      required: true,
      minRows: 1,
      labels: {
        singular: 'Image',
        plural: 'Images',
      },
      admin: {
        description: 'The first image is used as the product card thumbnail.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      // Deliberately free-form: a laptop lists RAM/CPU/storage, a cable lists
      // length. Do not hard-code spec fields (plan §4).
      name: 'specs',
      type: 'array',
      labels: {
        singular: 'Spec',
        plural: 'Specs',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'stockStatus',
      type: 'select',
      required: true,
      defaultValue: 'in-stock',
      options: stockStatusOptions,
      admin: {
        position: 'sidebar',
        description: 'Status only — Phase 1 does not track quantities.',
      },
    },
    {
      name: 'badge',
      type: 'select',
      required: true,
      defaultValue: 'none',
      options: badgeOptions,
      admin: {
        position: 'sidebar',
        description:
          'Corner flag on the product card. "Hot" is manual merchandising; a discount flag is also inferred whenever a compare-at price is set.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show this product on the homepage.',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Unpublished products are hidden from the storefront entirely.',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Extra search keywords, e.g. "gaming", "refurbished".',
      },
    },
  ],
}
