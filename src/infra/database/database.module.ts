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
import { RecipientsRepository } from '@/domain/fast-feet/application/repositories/recipients-repository'
import { PgDriverRecipientsRepository } from './pgDriver/repositories/pg-driver-recipients-repository'
import { PackagesRepository } from '@/domain/fast-feet/application/repositories/packages-repository'
import { PgDriverPackagesRepository } from './pgDriver/repositories/pg-driver-packages-repository'
import { PhotosRepository } from '@/domain/fast-feet/application/repositories/photos-repository'
import { PgDriverPhotosRepository } from './pgDriver/repositories/pg-driver-photos-repository'
import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications-repository'
import { PgDriverNotificationsRepository } from './pgDriver/repositories/pg-driver-notifications-repository'

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
    {
      provide: RecipientsRepository,
      useClass: PgDriverRecipientsRepository,
    },
    {
      provide: PackagesRepository,
      useClass: PgDriverPackagesRepository,
    },
    {
      provide: PhotosRepository,
      useClass: PgDriverPhotosRepository,
    },
    {
      provide: NotificationsRepository,
      useClass: PgDriverNotificationsRepository,
    },
  ],
  exports: [
    PgDriverService,
    AdminsRepository,
    DeliveryPeopleRepository,
    RecipientsRepository,
    PackagesRepository,
    PhotosRepository,
    NotificationsRepository,
  ],
})
export class DatabaseModule extends ConfigurableDatabaseModule {}
