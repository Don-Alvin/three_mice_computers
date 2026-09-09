import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Brands } from './collections/Brands'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { Users } from './collections/Users'
import { SITE_NAME } from './lib/site'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const blobToken = process.env.BLOB_READ_WRITE_TOKEN
const resendApiKey = process.env.RESEND_API_KEY

/**
 * Sending domain for Payload's auth emails (password reset/verification),
 * plan §3: `defaultFromAddress` on a Resend-verified domain, `defaultFromName`
 * the shop name. Derived from `NEXT_PUBLIC_SERVER_URL` rather than a second
 * hardcoded literal, so the two can't drift — Resend verifies the apex domain,
 * so the `www.` host is stripped for the sender address.
 */
const serverHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? '').hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
})()

// Without a token the Vercel Blob adapter silently falls back to the local
// filesystem — which is ephemeral on Vercel, so uploads would vanish between
// deployments while appearing to work (plan §2). Fail the build instead.
if (!blobToken && process.env.NODE_ENV === 'production') {
  throw new Error(
    'BLOB_READ_WRITE_TOKEN is not set. Media uploads would fall back to the local ' +
      'filesystem, which is ephemeral on Vercel. Add the token from the Vercel Blob store.',
  )
}

export default buildConfig({
  admin: {
    user: Users.slug,
    /**
     * Payload defaults to Gravatar for the account picture, which was the ONLY
     * thing violating the M7 content-security policy — 19 blocked `img-src`
     * requests across the admin, and a broken avatar in every view.
     *
     * Switched off rather than allow-listing gravatar.com in the CSP, because
     * that fixes more than the CSP: the admin panel no longer sends a hash of
     * the client's email address to a third party on every page load, and §5.1's
     * "loosen only what the admin measurably needs" stays honoured — it needs
     * nothing.
     */
    avatar: 'default',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Products, Categories, Brands, Media, Users],
  editor: lexicalEditor(),
  /**
   * Auth emails only (password reset/verification) — plan §3, wired at M8.
   * `noreply@<domain>` needs the domain **verified in Resend** (DKIM/SPF) or
   * delivery silently fails; that DNS step is ops, not code, so this stays
   * omitted rather than half-wired until both `RESEND_API_KEY` and
   * `NEXT_PUBLIC_SERVER_URL` are actually set — Payload falls back to logging
   * an "email not configured" warning, same as every environment before M8.
   * Never for order/notification email (plan §13 — out of scope permanently).
   */
  ...(resendApiKey && serverHost
    ? {
        email: resendAdapter({
          apiKey: resendApiKey,
          defaultFromAddress: `noreply@${serverHost}`,
          defaultFromName: SITE_NAME,
        }),
      }
    : {}),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Plan §3a: the schema reaches the database only through committed
    // migrations, never a push.
    //
    // Deliberately a hard `false` rather than keyed off NODE_ENV: the Payload
    // CLI (`payload run`, `generate:types`, the seed script) sets
    // NODE_ENV=development, so an environment-based condition silently pushes
    // schema to the hosted database on ordinary commands — which is what §3a
    // exists to prevent. Local schema changes go through
    // `migrate:create` + `migrate` like production.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  upload: {
    limits: {
      fileSize: 5_000_000, // 5 MB — plan §4
    },
  },
  sharp,
  plugins: [
    // Media lives in Vercel Blob, not on disk — Vercel's filesystem is
    // ephemeral, so anything written locally disappears between deployments
    // (plan §2, decided at M2).
    vercelBlobStorage({
      // Explicit rather than implicit: with no token the adapter would quietly
      // do nothing and uploads would land on disk. Disabling it deliberately
      // makes local-disk storage a visible choice, not an accident.
      enabled: Boolean(blobToken),
      collections: {
        media: true,
      },
      token: blobToken ?? '',
    }),
  ],
})
