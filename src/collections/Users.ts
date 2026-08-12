import type { CollectionConfig } from 'payload'

import { authenticated } from '../access'

/**
 * Admin accounts. Auth config only — Payload adds the email and password fields
 * itself, so nothing is declared here (plan §4).
 *
 * The login lockout below IS the admin brute-force protection. It replaces an
 * external rate limiter for this route; do not add one (plan §5.4).
 *
 * Real 2FA is a Phase 2 plugin task, not a checkbox. Do not fake it.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // 10 minutes
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [],
}
