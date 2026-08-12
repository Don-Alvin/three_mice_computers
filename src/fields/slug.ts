import type { Field } from 'payload'

/**
 * Turn a display name into a URL-safe slug.
 *
 * `&` becomes "and" before punctuation is stripped, so "Cables & Power" reads
 * as `cables-and-power` rather than collapsing to `cables-power`.
 */
export const formatSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * A `slug` field that fills itself in from another field (default: `name`) but
 * stays editable — once a product is live its URL should not silently change
 * just because someone fixed a typo in the title.
 */
export const slugField = (sourceField = 'name'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Auto-filled from the name. Changing this changes the public URL.',
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc, value }) => {
        if (typeof value === 'string' && value.trim().length > 0) {
          return formatSlug(value)
        }

        const source: unknown = data?.[sourceField] ?? originalDoc?.[sourceField]

        if (typeof source === 'string' && source.trim().length > 0) {
          return formatSlug(source)
        }

        return value
      },
    ],
  },
})
