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
import { DeliveryPersonFactory } from 'test/factories/make-delivery-person'
import { PackageFactory } from 'test/factories/make-package'
import { RecipientFactory } from 'test/factories/make-recipient'
import { waitFor } from 'test/utils/wait-for'

describe('On Package Withdrew (E2E)', () => {
  let app: INestApplication
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
      providers: [DeliveryPersonFactory, RecipientFactory, PackageFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    deliveryPersonFactory = moduleRef.get(DeliveryPersonFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    packageFactory = moduleRef.get(PackageFactory)
    jwt = moduleRef.get(JwtService)
    notificationsRepository = moduleRef.get(NotificationsRepository)

    DomainEvents.shouldRun = true

    await app.init()
  })

  it('should send notifications when package is withdrew', async () => {
    const deliveryPerson =
      await deliveryPersonFactory.makePgDriverDeliveryPerson()

    const accessToken = jwt.sign({
      sub: deliveryPerson.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    const recipient = await recipientFactory.makePgDriverRecipient({
      name: 'John Doe',
    })

    const pkg = await packageFactory.makePgDriverPackage({
      recipientId: recipient.id,
      status: StatusOptions.waiting,
    })

    await request(app.getHttpServer())
      .patch(`/packages/${pkg.id.toString()}/withdraw-package`)
      .set('Authorization', `Bearer ${accessToken}`)

    await waitFor(async () => {
      const notificationOnDatabase =
        await notificationsRepository.findByRecipientId(recipient.id.toString())

      expect(notificationOnDatabase).not.toBeNull()
    })
  })
})
