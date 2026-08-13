import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

/**
 * Single memoized Payload instance for the whole app (plan §10, milestone 3).
 *
 * Server components and API routes must call this rather than `getPayload`
 * directly, so the config is sanitized and the database pool established once
 * instead of per call site. Holding the promise (not the resolved client) means
 * concurrent callers during startup share one initialisation rather than racing
 * to create several.
 *
 * This is the local API — an in-process call. Never fetch our own REST endpoints
 * from a server component; that would be an HTTP round-trip to ourselves.
 */
let clientPromise: Promise<Payload> | null = null

export const getPayloadClient = (): Promise<Payload> => {
  if (!clientPromise) {
    clientPromise = getPayload({ config })
  }

  return clientPromise
}
