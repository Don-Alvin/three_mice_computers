import React from 'react'

/**
 * Product detail has its own skeleton: the shared listing grid would be an
 * outright lie about what is arriving, and the layout shift when a two-column
 * detail page replaced a card grid would be the worst of both.
 */
export default function Loading() {
  return (
    <div className="wrap py-8" role="status" aria-label="Loading product">
      <div className="grid animate-pulse gap-8 lg:grid-cols-2">
        <div className="aspect-square rounded-2xl border border-line bg-muted" />

        <div className="flex flex-col gap-3">
          <div className="h-3 w-24 rounded bg-line/70" />
          <div className="h-8 w-4/5 rounded-lg bg-line/70" />
          <div className="mt-2 h-9 w-40 rounded-lg bg-line/70" />
          <div className="h-6 w-28 rounded-lg bg-line/70" />
          <div className="mt-4 h-[52px] w-full max-w-sm rounded-[11px] bg-line/70" />
          <div className="mt-6 h-4 w-full rounded bg-line/70" />
          <div className="h-4 w-11/12 rounded bg-line/70" />
          <div className="h-4 w-3/4 rounded bg-line/70" />
        </div>
      </div>
    </div>
  )
}
