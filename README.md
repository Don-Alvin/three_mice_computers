# Three Mice Computers

Computer and electronics accessories shop (Kenya). Mobile-first catalogue with a
cart and **WhatsApp checkout** — no payment gateway in Phase 1 — plus a Payload
admin panel the client uses to manage products himself.

Single Next.js app with Payload CMS embedded, deployed on Vercel.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript strict) |
| CMS / data layer | Payload CMS 3.88, embedded at `/admin` |
| Database | Postgres (Neon or Supabase, free tier) via `@payloadcms/db-postgres` |
| Media | Vercel Blob or Supabase Storage (Vercel's filesystem is ephemeral) |
| Hosting | Vercel — `main` is production, every `feat/` branch gets a preview |

## Getting started

Requires Node 20+ and pnpm 9. If pnpm isn't installed, `corepack enable pnpm`
picks up the version from the `packageManager` field.

```bash
pnpm install
cp .env.example .env      # then fill in real values — see below
pnpm dev                  # http://localhost:3000
```

The storefront runs without a database. **The admin panel at `/admin` does not** —
`DATABASE_URI` must point at a reachable Postgres instance before it will load.

## Environment variables

Copy `.env.example` to `.env` and fill it in. That file is the complete list;
five variables, no more. Never commit `.env`, and never put real values in
`.env.example`.

| Variable | Notes |
|---|---|
| `DATABASE_URI` | Use the **pooled** connection string, not the direct one |
| `PAYLOAD_SECRET` | 32+ chars — `openssl rand -base64 32` |
| `NEXT_PUBLIC_SERVER_URL` | Base URL, no trailing slash |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | International format, digits only, no `+` |
| `BLOB_READ_WRITE_TOKEN` | Only when media storage is Vercel Blob |

## Scripts

```bash
pnpm dev                 # dev server
pnpm devsafe             # dev server, clearing .next first
pnpm build               # production build
pnpm start               # serve the production build
pnpm typecheck           # tsc --noEmit
pnpm lint                # eslint .
pnpm generate:types      # regenerate src/payload-types.ts from collections
pnpm generate:importmap  # regenerate the admin import map
```

CI runs `tsc --noEmit` and `eslint .` on every push to `main` and `feat/**`.
Run both locally before calling a milestone done — code that fails either
cannot merge.

> `next lint` was removed in Next.js 16; ESLint is invoked directly.

## Project layout

```
src/
├── app/
│   ├── (frontend)/   # storefront
│   └── (payload)/    # admin panel + Payload REST/GraphQL routes (generated)
├── collections/      # Payload collection configs
├── payload.config.ts
└── payload-types.ts  # generated — do not edit by hand
```

## Working on this repo

Project rules for Claude Code — the git workflow, scope discipline and the
milestone/branch table — are in `claude.md`, which **is** committed.

Two reference documents are kept **local only** and are deliberately git-ignored,
so they will not be present in a fresh clone:

- `implementation.md` — single source of truth for scope, data model and security posture
- `shop-ui-prototype.html` — the approved visual reference

Read both before writing code. Work one milestone at a time, one `feat/` branch
per milestone.
