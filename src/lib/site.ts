/**
 * Site-wide content constants.
 *
 * Shop name is confirmed-pending per plan §12a. NOTE the live contradiction:
 * the logo now rendered in the header and footer reads "3M COMPUTERS" while
 * SITE_NAME below still reads "Three Mice Computers", so the page title, the
 * footer copyright and the logo link's accessible name all say something the
 * visitor cannot see. One line here settles it once the client confirms which
 * is customer-facing (§12a also flags the "3M" trademark overlap).
 */
export const SITE_NAME = 'Three Mice Computers'
export const SITE_TAGLINE = 'Innovation that Inspires'

export const SITE_DESCRIPTION =
  'Genuine computers, CCTV, networking, printers and accessories, delivered across Kenya. Order online or on WhatsApp.'

/**
 * Footer contact details. Phone, location and hours are the client's real
 * details and are rendered.
 *
 * `email` is still the obvious stand-in rather than a plausible invented one,
 * and the footer deliberately does NOT render it: an example.co.ke address in a
 * finished-looking footer invites mail nobody receives. Drop a real address in
 * and restore the row in `SiteFooter`.
 */
export const CONTACT = {
  phone: '+254 731 215 060',
  email: 'hello@example.co.ke',
  location: 'Kisumu, Kenya',
  hours: 'Mon-Sat, 8am-6pm',
} as const

export const ANNOUNCEMENTS = [
  'Order on WhatsApp · Pay via M-Pesa',
  'Genuine products, warranty backed',
] as const
