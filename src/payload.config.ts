import { postgresAdapter } from '@payloadcms/db-postgres'
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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const blobToken = process.env.BLOB_READ_WRITE_TOKEN

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
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Products, Categories, Brands, Media, Users],
  editor: lexicalEditor(),
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
