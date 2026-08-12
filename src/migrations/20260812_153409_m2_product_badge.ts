import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_badge" AS ENUM('none', 'hot', 'deal');
  ALTER TABLE "products" ADD COLUMN "badge" "enum_products_badge" DEFAULT 'none' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN "badge";
  DROP TYPE "public"."enum_products_badge";`)
}
