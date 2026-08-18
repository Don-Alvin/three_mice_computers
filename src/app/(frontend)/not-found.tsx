import type { Metadata } from 'next'
import React from 'react'

import { NotFoundContent } from '@/components/NotFoundContent'

/**
 * Route-level 404: the boundary for the `notFound()` calls in the product,
 * category and brand routes.
 *
 * Being inside the group means it renders within `(frontend)/layout.tsx`, so a
 * shopper who follows a stale product link keeps the header, category nav,
 * search and footer — the things that actually help them find the replacement.
 *
 * **Known limit:** a nested boundary cannot set the response status, so these
 * render with HTTP 200 (a soft 404). The `noindex` below is what stops them
 * being indexed. Only the root `app/not-found.tsx` emits a true 404, and it
 * handles the unmatched-URL case. See PROGRESS §3.
 */
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return <NotFoundContent />
}
