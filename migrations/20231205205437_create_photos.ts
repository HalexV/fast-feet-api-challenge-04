import { Knex } from 'knex'
import { config } from 'dotenv'

if (!process.env.DATABASE_SCHEMA) {
  config()
}

const schema = process.env.DATABASE_SCHEMA ?? 'public'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  CREATE TABLE "${schema}"."photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "package_id" TEXT NOT NULL,

    CONSTRAINT "photos_package_id_fkey" FOREIGN KEY("package_id") REFERENCES "${schema}"."packages"("id") ON DELETE CASCADE ON UPDATE CASCADE

  );
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  DROP TABLE "${schema}"."photos";
  `)
}
