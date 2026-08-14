import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `IF NOT EXISTS` (hand-added to Payload's generated SQL): a dev database that
 * ran Drizzle `push` already has brands.order, so a bare ADD COLUMN aborts the
 * migration there and leaves the row unrecorded. Postgres-only syntax, which is
 * the only adapter this project uses.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "order" numeric DEFAULT 0;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "brands" DROP COLUMN "order";`)
}
