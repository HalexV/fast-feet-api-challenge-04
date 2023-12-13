import { Global, Module } from '@nestjs/common'
import {
  CONNECTION_POOL,
  ConfigurableDatabaseModule,
  DATABASE_OPTIONS,
} from './pgDriver/database.module-definition'
import { PgDriverService } from './pgDriver/pgDriver.service'
import { DatabaseOptions } from './pgDriver/databaseOptions'
import { Pool } from 'pg'
import { AdminsRepository } from '@/domain/fast-feet/application/repositories/admins-repository'
import { PgDriverAdminsRepository } from './pgDriver/repositories/pg-driver-admins-repository'
import { DeliveryPeopleRepository } from '@/domain/fast-feet/application/repositories/delivery-people-repository'
import { PgDriverDeliveryPeopleRepository } from './pgDriver/repositories/pg-driver-delivery-people-repository'

@Global()
@Module({
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
    {
      provide: AdminsRepository,
      useClass: PgDriverAdminsRepository,
    },
    {
      provide: DeliveryPeopleRepository,
      useClass: PgDriverDeliveryPeopleRepository,
    },
  ],
  exports: [PgDriverService, AdminsRepository, DeliveryPeopleRepository],
})
export class DatabaseModule extends ConfigurableDatabaseModule {}
