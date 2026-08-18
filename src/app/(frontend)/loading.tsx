import React from 'react'

import { ListingSkeleton } from '@/components/Skeletons'

/**
 * Segment-level loading UI. Covers every storefront route that does not define
 * its own — listings, search, `/products`, `/deals` — all of which render the
 * same grid, so one skeleton is honest for all of them.
 *
 * These pages hit the database on a Neon pooled connection, so on a cold
 * function there is a real gap to fill rather than a theoretical one.
 */
export default function Loading() {
  return <ListingSkeleton />
}
