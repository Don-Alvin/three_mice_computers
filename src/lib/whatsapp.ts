import { SITE_NAME } from './site'

/**
 * WhatsApp order message (plan §7).
 *
 * Pure and side-effect free: it takes already-verified server values and returns
 * a string. Nothing here reads the cart store, so there is no path by which a
 * localStorage price can reach the message (§5.2, §14).
 *
 * Note the currency prefix is **KES**, not the `KSh` used on screen. That is the
 * plan's message format verbatim — `KSh` is the shop's display style, `KES` reads
 * unambiguously in a chat thread that may be quoted back or read aloud.
 */
export type OrderLine = {
  name: string
  slug: string
  /** Unit price, from the server. */
  price: number
  qty: number
}

const DIVIDER = '------------------------'

const amount = new Intl.NumberFormat('en-KE')

const money = (value: number): string => `KES ${amount.format(value)}`

export const orderTotal = (lines: OrderLine[]): number =>
  lines.reduce((total, line) => total + line.price * line.qty, 0)

export const buildOrderMessage = ({
  lines,
  customerName,
  location,
  baseUrl,
}: {
  lines: OrderLine[]
  customerName?: string
  location?: string
  baseUrl: string
}): string => {
  const origin = baseUrl.replace(/\/+$/, '')

  const parts = [
    `NEW ORDER — ${SITE_NAME}`,
    DIVIDER,
    // "× 2 — KES 3,000" is the LINE total, not the unit price: the plan's example
    // totals 88,000 from 85,000 + 3,000 for a 2× item at 1,500.
    ...lines.map(
      (line, index) =>
        `${index + 1}. ${line.name} × ${line.qty} — ${money(line.price * line.qty)}`,
    ),
    DIVIDER,
    `TOTAL: ${money(orderTotal(lines))}`,
  ]

  // Both optional, and both exist only inside this string — never sent to the
  // server, never stored (§5.4, plan §13: no customer PII server-side).
  if (customerName) {
    parts.push(`Name: ${customerName}`)
  }

  if (location) {
    parts.push(`Location: ${location}`)
  }

  parts.push('', 'Product links:', ...lines.map((line) => `${origin}/product/${line.slug}`))

  return parts.join('\n')
}

/**
 * `encodeURIComponent` turns the newlines into `%0A`, which is what wa.me needs
 * to preserve line breaks (§14). Do not swap it for a "friendlier" encoder.
 */
export const buildWhatsAppUrl = (message: string, phoneNumber: string): string =>
  `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

/**
 * The shop's number is configuration, not a secret, but it is still only ever
 * read from the environment (never literal in the repo). An unset or still-
 * placeholder value must disable checkout rather than produce a wa.me link to
 * nobody — which is exactly what would ship if a preview missed the env var.
 */
export const isUsableWhatsAppNumber = (value: string | undefined): value is string =>
  typeof value === 'string' && /^[0-9]{7,15}$/.test(value)
