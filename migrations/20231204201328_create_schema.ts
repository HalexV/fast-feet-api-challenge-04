import { Knex } from 'knex'
import { config } from 'dotenv'

if (!process.env.DATABASE_SCHEMA) {
  config()
}

const schema = process.env.DATABASE_SCHEMA ?? 'public'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`CREATE SCHEMA IF NOT EXISTS "${schema}"`)
}

export async function down(knex: Knex): Promise<void> {
  if (schema !== 'public') {
    await knex.raw(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
  }
}
