import type { CollectionConfig } from 'payload'

import { APIError } from 'payload'

import { anyone, authenticated } from '../access'

/** Plan §4: 5 MB ceiling on uploaded images. */
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

/**
 * Uploads are restricted to images and converted to WebP (plan §4).
 *
 * Heights are left undefined so Sharp preserves each image's aspect ratio and
 * only ever scales down — product photos arrive in wildly different shapes.
 *
 * Files land in Vercel Blob, configured in payload.config.ts. Vercel's own
 * filesystem is ephemeral, so uploads must never be stored locally in a
 * deployed environment.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Catalogue',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    /**
     * Size guard. `upload.limits.fileSize` in payload.config.ts is the
     * request-level backstop, but on its own an oversized file fails ~3s later
     * inside Sharp with a generic "problem while uploading" the client cannot
     * act on. Checking here — before the file reaches Sharp — lets us throw
     * something actionable instead.
     *
     * Covers `update` as well as `create`: replacing a product image is a PATCH,
     * so a create-only guard would let oversized replacements straight through.
     *
     * By design this does NOT bound `payload.create()` from the local API —
     * there is no `req.file` on those calls (e.g. the seed script).
     */
    beforeOperation: [
      ({ operation, req }) => {
        if (
          (operation === 'create' || operation === 'update') &&
          req.file &&
          req.file.size > MAX_UPLOAD_BYTES
        ) {
          throw new APIError(
            'Image is too large. Please use an image under 5 MB. On a phone, share it at "Medium" size or compress it first.',
            400,
          )
        }
      },
    ],
  },
  upload: {
    mimeTypes: ['image/*'],
    formatOptions: {
      format: 'webp',
      options: { quality: 82 },
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: undefined,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'card',
        width: 600,
        height: undefined,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'full',
        width: 1200,
        height: undefined,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Describe the image for screen readers and search engines.',
      },
    },
  ],
}
