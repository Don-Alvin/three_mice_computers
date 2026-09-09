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

/**
 * Displays a Kenyan number stored digits-only, international format, no `+`
 * (the `NEXT_PUBLIC_WHATSAPP_NUMBER` convention, plan §14) the way `CONTACT.phone`
 * is already hand-formatted: `+254 768 261 955`. Kenyan mobile numbers are always
 * `254` plus 9 digits, so the grouping is fixed rather than generalized for
 * country codes this shop does not have.
 */
export const formatKenyaPhone = (digits: string): string =>
  `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`
