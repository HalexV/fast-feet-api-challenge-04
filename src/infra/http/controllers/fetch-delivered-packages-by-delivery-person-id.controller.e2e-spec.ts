import { Role } from '@/core/types/role.enum'
import { StatusOptions } from '@/core/types/status'
import { DeliveryPerson } from '@/domain/fast-feet/enterprise/entities/DeliveryPerson'
import { Recipient } from '@/domain/fast-feet/enterprise/entities/Recipient'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PgDriverService } from '@/infra/database/pgDriver/pgDriver.service'
import { EnvModule } from '@/infra/env/env.module'
import { EnvService } from '@/infra/env/env.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { DeliveryPersonFactory } from 'test/factories/make-delivery-person'
import { PackageFactory } from 'test/factories/make-package'
import { RecipientFactory } from 'test/factories/make-recipient'

describe('Fetch Delivered Packages By Delivery Person Id (E2E)', () => {
  let app: INestApplication
  let packageFactory: PackageFactory
  let recipientFactory: RecipientFactory
  let deliveryPersonFactory: DeliveryPersonFactory
  let jwt: JwtService
  let pgDriver: PgDriverService
  let envService: EnvService
  let deliveryPerson1: DeliveryPerson
  let deliveryPerson2: DeliveryPerson
  let recipient1: Recipient
  let recipient2: Recipient

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
      providers: [RecipientFactory, PackageFactory, DeliveryPersonFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    recipientFactory = moduleRef.get(RecipientFactory)
    packageFactory = moduleRef.get(PackageFactory)
    deliveryPersonFactory = moduleRef.get(DeliveryPersonFactory)
    jwt = moduleRef.get(JwtService)
    pgDriver = moduleRef.get(PgDriverService)
    envService = moduleRef.get(EnvService)

    await app.init()

    deliveryPerson1 = await deliveryPersonFactory.makePgDriverDeliveryPerson()

    deliveryPerson2 = await deliveryPersonFactory.makePgDriverDeliveryPerson()

    recipient1 = await recipientFactory.makePgDriverRecipient({
      name: 'John Doe',
    })

    recipient2 = await recipientFactory.makePgDriverRecipient({
      name: 'Mary Doe',
    })
  })

  beforeEach(async () => {
    await pgDriver.runQuery(
      `DELETE FROM "${envService.get('DATABASE_SCHEMA')}".packages;`,
    )
  })

  test('[GET] /packages/delivered/:deliveryPersonId', async () => {
    const accessToken = jwt.sign({
      sub: deliveryPerson1.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    const pkg1 = await packageFactory.makePgDriverPackage({
      recipientId: recipient1.id,
      status: StatusOptions.delivered,
      deliveryPersonId: deliveryPerson1.id,
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipient1.id,
      status: StatusOptions.delivered,
      deliveryPersonId: deliveryPerson2.id,
    })

    const pkg3 = await packageFactory.makePgDriverPackage({
      recipientId: recipient2.id,
      status: StatusOptions.delivered,
      deliveryPersonId: deliveryPerson1.id,
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipient2.id,
      status: StatusOptions.delivered,
      deliveryPersonId: deliveryPerson2.id,
    })

    const response = await request(app.getHttpServer())
      .get(`/packages/delivered/${deliveryPerson1.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.packages).toHaveLength(2)
    expect(response.body).toEqual({
      packages: expect.arrayContaining([
        expect.objectContaining({
          packageId: pkg1.id.toString(),
          deliveryPersonId: deliveryPerson1.id.toString(),
        }),
        expect.objectContaining({
          packageId: pkg3.id.toString(),
          deliveryPersonId: deliveryPerson1.id.toString(),
        }),
      ]),
    })
  })

  test('[GET] /packages/delivered/:deliveryPersonId?page=2', async () => {
    const accessToken = jwt.sign({
      sub: deliveryPerson1.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    for (let i = 0; i < 20; i++) {
      await packageFactory.makePgDriverPackage({
        recipientId: recipient1.id,
        status: StatusOptions.delivered,
        deliveryPersonId: deliveryPerson1.id,
      })
    }

    await packageFactory.makePgDriverPackage({
      recipientId: recipient1.id,
      status: StatusOptions.delivered,
      deliveryPersonId: deliveryPerson1.id,
      description: 'pkg 21',
      postedAt: new Date('2000-01-01'),
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipient1.id,
      status: StatusOptions.delivered,
      deliveryPersonId: deliveryPerson1.id,
      description: 'pkg 22',
      postedAt: new Date('2000-01-01'),
    })

    const response = await request(app.getHttpServer())
      .get(`/packages/delivered/${deliveryPerson1.id.toString()}?page=2`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.packages).toHaveLength(2)
    expect(response.body).toEqual({
      packages: expect.arrayContaining([
        expect.objectContaining({
          deliveryPersonId: deliveryPerson1.id.toString(),
          description: 'pkg 21',
        }),
        expect.objectContaining({
          deliveryPersonId: deliveryPerson1.id.toString(),
          description: 'pkg 22',
        }),
      ]),
    })
  })

  test('it should receive 403 when an user delivery person fetches another delivery person delivered packages', async () => {
    const deliveryPerson1 =
      await deliveryPersonFactory.makePgDriverDeliveryPerson()

    const accessToken = jwt.sign({
      sub: deliveryPerson1.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    const deliveryPerson2 =
      await deliveryPersonFactory.makePgDriverDeliveryPerson()

    const response = await request(app.getHttpServer())
      .get(`/packages/delivered/${deliveryPerson2.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(403)
  })
})
