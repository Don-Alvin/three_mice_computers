import type { MetadataRoute } from 'next'

/**
 * robots.txt (plan §9).
 *
 * **Lives at `app/` root, NOT inside the `(frontend)` route group.** Next only
 * resolves `robots` at the app root: placed in a group it compiles silently to
 * nothing, never appears in the build's route table, and `/robots.txt` 404s.
 * `sitemap.ts` *does* resolve inside a group (it supports nested sitemaps), but
 * it is kept here too so the two site-wide metadata routes stay together.
 *
 * **Allow all crawlers, including AI crawlers** — this is an explicit ruling in
 * §5.4, not an oversight. The shop wants to be found when someone asks an
 * assistant where to buy electronics in Kenya, exactly as it wants Google. Do
 * not add GPTBot/CCBot disallow rules here.
 *
 * `/admin` and `/api` are excluded because they are not content: the admin is
 * behind auth anyway, and crawling the REST surface wastes budget on JSON that
 * duplicates the pages. `/cart` is excluded because it renders empty to anyone
 * who is not the shopper whose localStorage it reads.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SERVER_URL ?? '').replace(/\/+$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/cart'],
      },
    ],
    // Omitted rather than emitted relative: a sitemap line without an absolute
    // URL is invalid, and pointing crawlers at a broken one is worse than none.
    ...(baseUrl ? { sitemap: `${baseUrl}/sitemap.xml`, host: baseUrl } : {}),
  }
}
