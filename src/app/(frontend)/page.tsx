import Link from 'next/link'
import React from 'react'

/**
 * Milestone 1 placeholder. Deliberately does not touch Payload or the database
 * so the Vercel deploy is verifiable before DATABASE_URI is provisioned — the
 * admin panel at /admin is what exercises the Postgres connection.
 *
 * The real storefront lands in Milestone 4, built against shop-ui-prototype.html.
 */
export default function HomePage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#F4F5F7] p-6">
      <div className="w-full max-w-md rounded-xl border border-[#E7E8EB] bg-white p-10 text-center">
        <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#E11128] uppercase">
          Milestone 1 — scaffold
        </p>
        <h1 className="mb-3 text-3xl leading-tight font-bold tracking-tight text-[#141414]">
          Three Mice Computers
        </h1>
        <p className="mb-7 text-[15px] leading-relaxed text-[#6B7075]">
          Next.js, Payload and Tailwind are running. The storefront is not built yet.
        </p>
        <Link
          className="inline-block rounded-lg bg-[#141414] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#E11128]"
          href="/admin"
        >
          Go to admin panel
        </Link>
      </div>
    </div>
  )
}
