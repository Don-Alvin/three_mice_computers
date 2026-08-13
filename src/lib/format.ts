/**
 * Prices are KES integers everywhere (plan §14). Rendered as `KSh 12,345`.
 *
 * Deliberately not `style: 'currency'` — that yields "KES 12,345.00", with an
 * ISO code and decimal places the shop never uses. The prototype's format is
 * the grouped integer with a "KSh" prefix.
 */
const kesFormatter = new Intl.NumberFormat('en-KE')

export const formatKES = (value: number): string => `KSh ${kesFormatter.format(value)}`

/** Discount percentage for a compare-at price, rounded like the prototype. */
export const discountPercent = (price: number, compareAtPrice: number): number =>
  Math.round((1 - price / compareAtPrice) * 100)
