import { Knex } from 'knex'
import { config } from 'dotenv'

if (!process.env.DATABASE_SCHEMA) {
  config()
}

const schema = process.env.DATABASE_SCHEMA ?? 'public'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  CREATE TABLE "${schema}"."notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipient_id" TEXT NOT NULL,

    CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY("recipient_id") REFERENCES "${schema}"."recipients"("id") ON DELETE CASCADE ON UPDATE CASCADE

  );
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  DROP TABLE "${schema}"."notifications";
  `)
}
