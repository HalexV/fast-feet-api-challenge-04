import { DomainEvents } from '@/core/events/domain-events'
import { Role } from '@/core/types/role.enum'
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
import { PackageFactory } from 'test/factories/make-package'
import { RecipientFactory } from 'test/factories/make-recipient'
import { waitFor } from 'test/utils/wait-for'

describe('On Package Waiting (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
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
      providers: [AdminFactory, RecipientFactory, PackageFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    adminFactory = moduleRef.get(AdminFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    packageFactory = moduleRef.get(PackageFactory)
    jwt = moduleRef.get(JwtService)
    notificationsRepository = moduleRef.get(NotificationsRepository)

    DomainEvents.shouldRun = true

    await app.init()
  })

  it('should send notifications when package is waiting', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    const recipient = await recipientFactory.makePgDriverRecipient({
      name: 'John Doe',
    })

    const pkg = await packageFactory.makePgDriverPackage({
      recipientId: recipient.id,
    })

    await request(app.getHttpServer())
      .patch(`/packages/${pkg.id.toString()}/mark-as-waiting`)
      .set('Authorization', `Bearer ${accessToken}`)

    await waitFor(async () => {
      const notificationOnDatabase =
        await notificationsRepository.findByRecipientId(recipient.id.toString())

      expect(notificationOnDatabase).not.toBeNull()
    })
  })
})
