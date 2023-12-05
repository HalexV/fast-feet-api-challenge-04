import { Knex } from 'knex'
import { config } from 'dotenv'

config()

const schema = process.env.DATABASE_SCHEMA ?? 'public'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  CREATE TYPE "${schema}"."role_enum" AS ENUM ('ADMIN', 'DELIVERY_PERSON');
  CREATE TABLE "${schema}"."users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "is_active" BOOLEAN,
    "roles" "${schema}"."role_enum"[]
  );
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  DROP TABLE "${schema}"."users";
  DROP TYPE "${schema}"."role_enum";
  `)
}
