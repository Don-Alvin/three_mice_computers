/**
 * Site-wide content constants.
 *
 * Shop name is confirmed-pending per plan §12a — treat as final unless the
 * client says otherwise. The contact details below are NOT client-supplied yet;
 * they are deliberately obvious placeholders rather than plausible-looking
 * invented ones, so nobody mistakes them for real and ships them.
 */
export const SITE_NAME = 'Three Mice Computers'
export const SITE_TAGLINE = 'Innovation that Inspires'

export const SITE_DESCRIPTION =
  'Genuine computers, CCTV, networking, printers and accessories, delivered across Kenya. Order online or on WhatsApp.'

/** TODO(M8): replace with the client's real details before launch. */
export const CONTACT_PLACEHOLDERS = {
  phone: '+254 731 215 060',
  email: 'hello@example.co.ke',
  location: 'Kisumu, Kenya',
  hours: 'Mon–Sat, 8am–6pm',
} as const

export const ANNOUNCEMENTS = [
  'Order on WhatsApp · Pay via M-Pesa',
  'Genuine products, warranty backed',
] as const
