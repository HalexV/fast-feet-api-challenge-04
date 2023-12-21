import { Role } from '@/core/types/role.enum'
import { StatusOptions } from '@/core/types/status'
import { PackagesRepository } from '@/domain/fast-feet/application/repositories/packages-repository'
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

describe('Withdraw Package (E2E)', () => {
  let app: INestApplication
  let deliveryPersonFactory: DeliveryPersonFactory
  let packageFactory: PackageFactory
  let recipientFactory: RecipientFactory
  let packagesRepository: PackagesRepository
  let jwt: JwtService

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
    packagesRepository = moduleRef.get(PackagesRepository)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('[PATCH] /packages/:id/withdraw-package', async () => {
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

    const date = new Date('2023-01-01')
    vi.setSystemTime(date)

    const response = await request(app.getHttpServer())
      .patch(`/packages/${pkg.id.toString()}/withdraw-package`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)

    const packageOnDatabase = await packagesRepository.findById(
      pkg.id.toString(),
    )

    expect(packageOnDatabase?.status).toBe(StatusOptions.withdrew)
    expect(packageOnDatabase?.withdrewAt).toStrictEqual(date)
  })

  test('it should receive 403 when user does not have a delivery person role', async () => {
    const deliveryPerson =
      await deliveryPersonFactory.makePgDriverDeliveryPerson()

    const accessToken = jwt.sign({
      sub: deliveryPerson.id.toString(),
      roles: [Role.Admin],
    })

    const response = await request(app.getHttpServer())
      .patch('/packages/non-existent-id/withdraw-package')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(403)
  })
})
