import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

/**
 * Security headers (plan §5.1).
 *
 * **This CSP is defense in depth, NOT an XSS control.** `script-src` carries
 * `'unsafe-inline'` because Next inlines its bootstrap and flight payloads —
 * which means an injected inline `<script>` or `onerror=` handler would still
 * execute. Do not read this policy as a backstop for §5.3: the actual XSS
 * control is rendering CMS rich text through Payload's Lexical serializer and
 * never through `dangerouslySetInnerHTML`. If that rule is broken, this header
 * will not save the page.
 *
 * What it does buy: script and connection *origins* are restricted to self, so
 * an injection cannot load a remote payload or beacon data out to an attacker's
 * host; `frame-ancestors` blocks clickjacking; `img-src` is narrowed to the one
 * media host we use.
 *
 * Strict per-request nonces would close the inline gap, and are deliberately not
 * used: they force every page to render dynamically, which would discard the ISR
 * caching §6 depends on (`revalidate: 300` on homepage, category, brand and
 * product) and turn a cheap static site into per-request database work — a poor
 * trade against a Phase 1 threat model with no third-party scripts (§5.4) and no
 * user-generated content.
 *
 * `img-src` carries the Vercel Blob host because that is where media lives, plus
 * `data:` and `blob:` for the admin's client-side previews.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
  "connect-src 'self' https://*.public.blob.vercel-storage.com",
  "font-src 'self' data:",
  "frame-ancestors 'self'",
].join('; ')

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: CSP },
]

const nextConfig: NextConfig = {
  headers: async () => [{ source: '/:path*', headers: securityHeaders }],

  // Next's dev server otherwise re-stamps an agent-rules block into CLAUDE.md on
  // every run (default `true`), and that injected text tells the agent to commit
  // it — which CLAUDE.md's git rules forbid. Turning it off stops the recurring
  // phantom diff at source. Version-matched Next docs are still readable at
  // node_modules/next/dist/docs/ without the file being rewritten.
  agentRules: false,

  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    // Media is served from Vercel Blob (plan §2). `images.domains` was removed
    // in Next 16, so this must be remotePatterns (plan §6).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
