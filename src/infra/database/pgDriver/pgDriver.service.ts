import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common'
import { CONNECTION_POOL } from './database.module-definition'
import { Pool } from 'pg'

@Injectable()
export class PgDriverService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(CONNECTION_POOL) private readonly pool: Pool) {}

  async runQuery(query: string, params?: unknown[]) {
    return await this.pool.query(query, params)
  }

  async onModuleInit() {
    await this.runQuery('SELECT NOW()')
  }

  async onModuleDestroy() {
    await this.pool.end()
  }
}
