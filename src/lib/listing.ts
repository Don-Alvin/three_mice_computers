import type { ProductSort } from './catalogue'

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

const VALID = new Set<string>(SORT_OPTIONS.map((option) => option.value))

/** Never trust a query string — fall back to the default rather than throwing. */
export const parseProductSort = (value: string | string[] | undefined): ProductSort =>
  typeof value === 'string' && VALID.has(value) ? (value as ProductSort) : 'newest'

/** Page numbers come from the URL too, so clamp to a sane positive integer. */
export const parsePage = (value: string | string[] | undefined): number => {
  const parsed = Number(typeof value === 'string' ? value : 1)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}
