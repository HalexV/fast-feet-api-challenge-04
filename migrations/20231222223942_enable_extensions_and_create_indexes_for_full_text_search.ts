import { Knex } from 'knex'
import { config } from 'dotenv'

if (!process.env.DATABASE_SCHEMA) {
  config()
}

const schema = process.env.DATABASE_SCHEMA ?? 'public'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA "${schema}";
  
  CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA "${schema}";

  CREATE OR REPLACE FUNCTION "${schema}"."immutable_unaccent"(regdictionary, text)
  RETURNS text
  LANGUAGE c IMMUTABLE PARALLEL SAFE STRICT AS
  '$libdir/unaccent', 'unaccent_dict';

  CREATE OR REPLACE FUNCTION "${schema}"."f_unaccent"(text)
  RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
  RETURN "${schema}"."immutable_unaccent"(regdictionary 'unaccent', $1);

  CREATE INDEX recipients_unaccent_city_trgm_idx ON "${schema}"."recipients"
  USING gin (f_unaccent(city) gin_trgm_ops);

  CREATE INDEX recipients_unaccent_district_trgm_idx ON "${schema}"."recipients"
  USING gin (f_unaccent(district) gin_trgm_ops);
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  DROP INDEX "${schema}"."recipients_unaccent_city_trgm_idx";
  DROP INDEX "${schema}"."recipients_unaccent_district_trgm_idx";
  DROP FUNCTION "${schema}"."f_unaccent";
  DROP FUNCTION "${schema}"."immutable_unaccent";
  DROP EXTENSION pg_trgm;
  DROP EXTENSION unaccent;
  `)
}
