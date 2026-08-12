import type { Access } from 'payload'

/**
 * Access control for the catalogue.
 *
 * Plan §4: public *read* on categories/brands/products/media (published only);
 * every write requires an authenticated admin user.
 */

/** Public read. The catalogue is meant to be crawled and shared. */
export const anyone: Access = () => true

/** Any logged-in admin user. Phase 1 has exactly one role. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

/**
 * Admins see every product; the public sees only published ones.
 *
 * Returning a query constraint (rather than false) means unpublished products
 * are filtered out of list results instead of 403-ing, which is what the
 * storefront and `/api/verify-cart` both need.
 */
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true

  return {
    published: {
      equals: true,
    },
  }
}
