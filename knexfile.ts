import { config } from 'dotenv'
import { Knex } from 'knex'

config()

const knexConfig: Knex.Config = {
  client: 'postgresql',
  connection: {
    connectionString: process.env.POSTGRES_URL,
  },
}

module.exports = knexConfig
