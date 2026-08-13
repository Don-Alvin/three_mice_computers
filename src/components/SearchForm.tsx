import React from 'react'

/**
 * Search box.
 *
 * claude.md permits `"use client"` for the search input, but it turns out not to
 * need it: a plain GET form navigating to /search?q=… gives the same behaviour,
 * works with JavaScript disabled, and keeps the header a server component.
 */
export const SearchForm = ({
  defaultValue = '',
  className = '',
}: {
  defaultValue?: string
  className?: string
}) => (
  <form
    action="/search"
    method="get"
    role="search"
    className={`flex h-[46px] items-center rounded-[10px] border border-line bg-muted px-3.5 transition-colors focus-within:border-red ${className}`}
  >
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="shrink-0 text-text-muted"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
    <input
      type="search"
      name="q"
      defaultValue={defaultValue}
      placeholder="Search laptops, cables, CCTV, toner…"
      aria-label="Search products"
      className="min-w-0 flex-1 border-none bg-transparent px-2.5 text-[15px] outline-none"
    />
    <button
      type="submit"
      className="rounded-lg bg-red px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-red-dark"
    >
      Search
    </button>
  </form>
)
