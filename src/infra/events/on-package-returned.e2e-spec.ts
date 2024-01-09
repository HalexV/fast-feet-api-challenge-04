import { DomainEvents } from '@/core/events/domain-events'
import { Role } from '@/core/types/role.enum'
import { StatusOptions } from '@/core/types/status'
import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications-repository'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { EnvModule } from '@/infra/env/env.module'
import { EnvService } from '@/infra/env/env.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { DeliveryPersonFactory } from 'test/factories/make-delivery-person'
import { PackageFactory } from 'test/factories/make-package'
import { RecipientFactory } from 'test/factories/make-recipient'
import { waitFor } from 'test/utils/wait-for'

describe('On Package Returned (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let deliveryPersonFactory: DeliveryPersonFactory
  let recipientFactory: RecipientFactory
  let packageFactory: PackageFactory
  let jwt: JwtService
  let notificationsRepository: NotificationsRepository

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AppModule,
        DatabaseModule.forRootAsync({
          imports: [EnvModule],
          inject: [EnvService],
          useFactory: (envService: EnvService) => ({
            connectionString: envService.get('POSTGRES_URL'),
          }),
        }),
      ],
      providers: [
        AdminFactory,
        DeliveryPersonFactory,
        RecipientFactory,
        PackageFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    adminFactory = moduleRef.get(AdminFactory)
    deliveryPersonFactory = moduleRef.get(DeliveryPersonFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    packageFactory = moduleRef.get(PackageFactory)
    jwt = moduleRef.get(JwtService)
    notificationsRepository = moduleRef.get(NotificationsRepository)

    DomainEvents.shouldRun = true

    await app.init()
  })

  it('should send notifications when package is returned', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    const deliveryPerson =
      await deliveryPersonFactory.makePgDriverDeliveryPerson()

    const recipient = await recipientFactory.makePgDriverRecipient({
      name: 'John Doe',
    })

    const pkg = await packageFactory.makePgDriverPackage({
      recipientId: recipient.id,
      status: StatusOptions.withdrew,
      withdrewAt: new Date('2023-01-01'),
      deliveryPersonId: deliveryPerson.id,
    })

    await request(app.getHttpServer())
      .patch(`/packages/${pkg.id.toString()}/return-package`)
      .set('Authorization', `Bearer ${accessToken}`)

    await waitFor(async () => {
      const notificationOnDatabase =
        await notificationsRepository.findByRecipientId(recipient.id.toString())

      expect(notificationOnDatabase).not.toBeNull()
    })
  })
})
