import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
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
