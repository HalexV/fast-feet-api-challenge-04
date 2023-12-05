import { Global, Module } from '@nestjs/common'
import {
  CONNECTION_POOL,
  ConfigurableDatabaseModule,
  DATABASE_OPTIONS,
} from './pgDriver/database.module-definition'
import { PgDriverService } from './pgDriver/pgDriver.service'
import { DatabaseOptions } from './pgDriver/databaseOptions'
import { Pool } from 'pg'

@Global()
@Module({
  exports: [PgDriverService],
  providers: [
    {
      provide: CONNECTION_POOL,
      inject: [DATABASE_OPTIONS],
      useFactory: (databaseOptions: DatabaseOptions) => {
        return new Pool({
          connectionString: databaseOptions.connectionString,
        })
      },
    },
    PgDriverService,
  ],
})
export class DatabaseModule extends ConfigurableDatabaseModule {}
