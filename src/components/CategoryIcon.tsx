import React from 'react'

/**
 * Category glyphs, ported from shop-ui-prototype.html so the tile grid matches
 * the approved design. Keyed by category slug; unknown slugs fall back to the
 * generic computer icon, so adding a category in the admin never renders empty.
 */
const paths: Record<string, React.ReactNode> = {
  laptops: (
    <>
      <rect x="4" y="5" width="16" height="10" rx="1.5" />
      <path d="M2 19h20" />
    </>
  ),
  desktops: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  monitors: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M9 20h6M12 16v4" />
    </>
  ),
  printers: (
    <>
      <rect x="6" y="3" width="12" height="6" />
      <rect x="4" y="9" width="16" height="8" rx="1.5" />
      <rect x="7" y="15" width="10" height="6" />
    </>
  ),
  'flash-disks': (
    <>
      <rect x="8" y="2" width="8" height="14" rx="1.5" />
      <path d="M10 16v4h4v-4M10 6h4" />
    </>
  ),
  'cctv-cameras': (
    <>
      <path d="M3 7l16-3 1 4-16 3z" />
      <path d="M5 11v4a2 2 0 0 0 2 2h3" />
      <circle cx="15" cy="9" r="1" />
    </>
  ),
  'computer-hubs': (
    <>
      <rect x="3" y="9" width="18" height="6" rx="2" />
      <circle cx="7" cy="12" r="1" />
      <circle cx="11" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
    </>
  ),
  mouse: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="5" />
      <path d="M12 6v4" />
    </>
  ),
  keyboards: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
    </>
  ),
  'multimedia-speakers': (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <circle cx="12" cy="14" r="3" />
      <circle cx="12" cy="7" r="1" />
    </>
  ),
  'bluetooth-speakers': <path d="M7 8l10 8-5 4V4l5 4L7 16" />,
  'computer-blower': (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 9c2-3 5-3 6 0-1 2-4 2-6 0zM12 15c-2 3-5 3-6 0 1-2 4-2 6 0z" />
    </>
  ),
  'toner-cartridges': (
    <>
      <rect x="3" y="8" width="18" height="8" rx="4" />
      <circle cx="8" cy="12" r="1.5" />
    </>
  ),
  'hdmi-cables': (
    <>
      <path d="M4 10h16l-2 4H6z" />
      <path d="M9 14v3M15 14v3" />
    </>
  ),
  'extension-cables': (
    <>
      <rect x="3" y="9" width="18" height="7" rx="2" />
      <path d="M8 12h.01M11 12h.01M14 12h.01" />
      <path d="M3 12H1" />
    </>
  ),
  ups: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M12 7l-2 4h4l-2 4" />
    </>
  ),
}

/** Hard disks of every flavour share the drive glyph. */
const drive = (
  <>
    <rect x="3" y="7" width="18" height="10" rx="2" />
    <circle cx="17" cy="12" r="1.2" />
  </>
)

/** LAN cables, indoor and outdoor, share the cable glyph. */
const cable = (
  <>
    <path d="M4 8a4 4 0 0 1 8 0v8a4 4 0 0 0 8 0" />
    <path d="M3 8h3M18 16h3" />
  </>
)

const fallback = (
  <>
    <rect x="3" y="4" width="18" height="12" rx="1.5" />
    <path d="M8 20h8M12 16v4" />
  </>
)

const resolve = (slug: string): React.ReactNode => {
  if (paths[slug]) {
    return paths[slug]
  }

  if (slug.includes('hardisk') || slug.includes('harddisk')) {
    return drive
  }

  if (slug.includes('lan-cable')) {
    return cable
  }

  return fallback
}

export const CategoryIcon = ({ slug }: { slug: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    aria-hidden="true"
  >
    {resolve(slug)}
  </svg>
)
