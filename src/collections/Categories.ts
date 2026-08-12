import type { CollectionConfig } from 'payload'

import { anyone, authenticated } from '../access'
import { slugField } from '../fields/slug'

/**
 * The five nav groups. These exist only to organise the menu — category pages
 * themselves stay flat (plan §4), so nothing routes on these values.
 */
export const categoryGroupOptions = [
  { label: 'Computing', value: 'computing' },
  { label: 'Storage', value: 'storage' },
  { label: 'Networking & CCTV', value: 'networking-cctv' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Cables & Power', value: 'cables-power' },
]

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'group', 'order'],
    group: 'Catalogue',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    slugField(),
    {
      name: 'group',
      type: 'select',
      required: true,
      options: categoryGroupOptions,
      admin: {
        description: 'Which nav menu group this category appears under.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers show first.',
      },
    },
    {
      name: 'seoTitle',
      type: 'text',
      admin: {
        description: 'Overrides the page title. Leave blank to use the category name.',
      },
    },
    {
      name: 'seoDescription',
      type: 'textarea',
    },
  ],
}
