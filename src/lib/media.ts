import type { Media } from '../payload-types'

/**
 * A relationship is either a populated document or a bare id, depending on the
 * query depth. Everything here reads at depth 1, but the type allows both, so
 * narrow rather than assume.
 */
export type MediaRef = number | Media | null | undefined

export type ResolvedImage = {
  url: string
  width: number
  height: number
  alt: string
}

const SIZE_FALLBACK = { width: 1200, height: 1200 }

/**
 * Payload emits absolute URLs for media it serves itself, because `serverURL`
 * is configured — e.g. `http://localhost:3000/api/media/file/x.webp`. next/image
 * then treats them as remote and rejects them with
 * `"url" parameter is not allowed`, since the host is not in `remotePatterns`.
 *
 * Rewriting our own `/api/...` URLs to origin-relative makes them local images,
 * covered by `localPatterns`, and incidentally immune to the host or port
 * differing between the configured serverURL and where the app is actually
 * served. Vercel Blob URLs have a different path and are left absolute, so they
 * keep matching `remotePatterns`.
 */
const toAppRelative = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url
  }

  try {
    const parsed = new URL(url)

    return parsed.pathname.startsWith('/api/') ? `${parsed.pathname}${parsed.search}` : url
  } catch {
    return url
  }
}

/**
 * Resolve an uploaded image to the generated size we actually want to render,
 * falling back to the original when that size is missing (Payload skips a size
 * when the source image is smaller than it).
 *
 * Returns null when the relationship is unpopulated or the upload has no URL,
 * so callers render their placeholder instead of a broken image.
 */
export const resolveImage = (
  ref: MediaRef,
  size: 'thumbnail' | 'card' | 'full' = 'card',
): ResolvedImage | null => {
  if (!ref || typeof ref === 'number') {
    return null
  }

  const sized = ref.sizes?.[size]
  const url = sized?.url ?? ref.url

  if (!url) {
    return null
  }

  return {
    url: toAppRelative(url),
    width: sized?.width ?? ref.width ?? SIZE_FALLBACK.width,
    height: sized?.height ?? ref.height ?? SIZE_FALLBACK.height,
    alt: ref.alt,
  }
}
