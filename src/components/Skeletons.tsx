import React from 'react'

/**
 * Loading placeholders (plan §10.7).
 *
 * These mirror the real components' box sizes — card aspect ratio, two-line name
 * clamp, button height — so the page does not jump when content arrives. A
 * spinner would be less work and worse: it says "wait" without saying what for.
 *
 * `animate-pulse` is Tailwind's, and the stylesheet's `prefers-reduced-motion`
 * block already disables animation for anyone who asks.
 */
const Block = ({ className }: { className: string }) => (
  <div className={`rounded-lg bg-line/70 ${className}`} />
)

const CardSkeleton = () => (
  <article className="overflow-hidden rounded-[14px] border border-line bg-surface">
    <div className="aspect-square border-b border-line bg-muted" />
    <div className="flex flex-col gap-2 p-3.5">
      <Block className="h-3 w-1/3" />
      <Block className="h-3.5 w-full" />
      <Block className="h-3.5 w-2/3" />
      <Block className="mt-1 h-5 w-1/2" />
      <Block className="mt-1.5 h-9 w-full" />
    </div>
  </article>
)

export const CardGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div
    // The grid is decorative while loading; screen readers get the busy state
    // from the page, not from a dozen empty boxes.
    aria-hidden="true"
    className="grid animate-pulse grid-cols-2 gap-4 min-[720px]:grid-cols-3 lg:grid-cols-4"
  >
    {Array.from({ length: count }, (_, index) => (
      <CardSkeleton key={index} />
    ))}
  </div>
)

export const ListingSkeleton = () => (
  <div className="wrap py-8" role="status" aria-label="Loading products">
    <div className="animate-pulse">
      <Block className="h-8 w-56" />
      <Block className="mt-3 h-4 w-80" />
      <Block className="mt-6 h-4 w-24" />
    </div>
    <div className="mt-5">
      <CardGridSkeleton />
    </div>
  </div>
)
