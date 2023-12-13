import { config } from 'dotenv'

import { randomUUID } from 'node:crypto'
import { DomainEvents } from '@/core/events/domain-events'
import { envSchema } from '@/infra/env/env'

import { knex } from 'knex'
import { execSync } from 'node:child_process'

config({
  path: '.env',
  override: true,
})
config({
  path: '.env.test',
  override: true,
})

const schemaId = randomUUID()

process.env.DATABASE_SCHEMA = schemaId

const env = envSchema.parse(process.env)

const knexClient = knex({
  client: 'postgresql',
  connection: {
    connectionString: process.env.POSTGRES_URL,
  },
})

beforeAll(async () => {
  if (!env.POSTGRES_URL) {
    throw new Error('Please provide a POSTGRES_URL environment variable.')
  }

  DomainEvents.shouldRun = false

  await knexClient.raw(`CREATE SCHEMA IF NOT EXISTS "${schemaId}"`)

  execSync('npx knex migrate:latest')
})

afterAll(async () => {
  await knexClient.raw(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await knexClient.destroy()
})
