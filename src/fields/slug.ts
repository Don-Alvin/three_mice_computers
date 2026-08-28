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
  /*
   * NOT `required`, and that is the whole fix.
   *
   * The hook below has always been correct, but `required: true` made the admin
   * refuse to submit a blank slug: required is enforced client side, in the
   * browser, BEFORE the request is sent, while this hook runs server side once
   * the request arrives. The field could therefore never be left blank for the
   * hook to fill, which is exactly the "slugs are not auto-filling" symptom.
   *
   * Leaving it optional is safe because the hook always yields a value: `name`
   * is itself required, so there is always a source to derive from on create,
   * and on update `originalDoc` supplies it when a partial payload omits it.
   */
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description:
      'Leave blank to auto-fill from the name. Set it by hand only to override; changing it changes the public URL.',
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
