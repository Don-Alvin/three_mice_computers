/**
 * Type declarations for static asset imports (the homepage hero banner).
 *
 * Next ships these in `next-env.d.ts`, which carries
 * `/// <reference types="next/image-types/global" />` and is what makes
 * `import banner from './hero-banner.jpg'` typecheck. That file is **generated**
 * by `next dev` / `next build` and is **gitignored**, so it simply does not
 * exist in CI: the workflow runs `tsc --noEmit` and `eslint .` and never invokes
 * Next. The hero banner is the first static image import in this codebase, so it
 * was the first thing to fail there while passing locally.
 *
 * Re-declaring the reference in a tracked file makes image imports typecheck
 * anywhere, with or without the generated file.
 */

/// <reference types="next/image-types/global" />
