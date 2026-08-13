import Link from 'next/link'
import React from 'react'

/** Section heading with the prototype's red rule and optional "more" link. */
export const SectionHead = ({
  title,
  href,
  linkLabel,
}: {
  title: string
  href?: string
  linkLabel?: string
}) => (
  <div className="mb-5 flex items-end justify-between gap-4">
    <h2 className="flex items-center gap-3 font-display text-2xl font-extrabold tracking-[-0.4px]">
      <span aria-hidden="true" className="h-6 w-[5px] rounded-[3px] bg-red" />
      {title}
    </h2>
    {href && linkLabel ? (
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-red hover:underline"
      >
        {linkLabel} →
      </Link>
    ) : null}
  </div>
)
