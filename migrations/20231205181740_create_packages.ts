import { Knex } from 'knex'
import { config } from 'dotenv'

if (!process.env.DATABASE_SCHEMA) {
  config()
}

const schema = process.env.DATABASE_SCHEMA ?? 'public'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  CREATE TYPE "${schema}"."status_enum" AS ENUM ('posted', 'waiting', 'withdrew', 'delivered', 'returned');
  CREATE TABLE "${schema}"."packages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "status" "${schema}"."status_enum" NOT NULL,
    "posted_at" TIMESTAMP(3),
    "withdrew_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "delivery_person_id" TEXT,
    "recipient_id" TEXT NOT NULL,

    CONSTRAINT "packages_delivery_person_id_fkey" FOREIGN KEY("delivery_person_id") REFERENCES "${schema}"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT "packages_recipient_id_fkey" FOREIGN KEY("recipient_id") REFERENCES "${schema}"."recipients"("id") ON DELETE CASCADE ON UPDATE CASCADE
    
  );
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  DROP TABLE "${schema}"."packages";
  DROP TYPE "${schema}"."status_enum";
  `)
}
