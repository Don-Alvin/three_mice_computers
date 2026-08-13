import { categoryGroupOptions } from '../collections/Categories'

import type { Category } from '../payload-types'

export type CategoryGroup = {
  label: string
  value: string
  categories: Category[]
}

/**
 * Buckets categories into the five nav groups, in the order declared on the
 * collection — reusing `categoryGroupOptions` so the menu can never drift from
 * the field's own options list.
 *
 * Empty groups are dropped: a group heading with nothing under it is a dead end
 * for the shopper, and can happen legitimately if every category in a group is
 * still unpublished.
 */
export const groupCategories = (categories: Category[]): CategoryGroup[] =>
  categoryGroupOptions
    .map(({ label, value }) => ({
      label,
      value,
      categories: categories.filter((category) => category.group === value),
    }))
    .filter((group) => group.categories.length > 0)
