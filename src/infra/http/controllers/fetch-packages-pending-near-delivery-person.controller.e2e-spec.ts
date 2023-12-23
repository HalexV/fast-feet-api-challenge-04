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

describe('Fetch Packages Pending Near Delivery Person (E2E)', () => {
  let app: INestApplication
  let packageFactory: PackageFactory
  let recipientFactory: RecipientFactory
  let deliveryPersonFactory: DeliveryPersonFactory
  let jwt: JwtService
  let pgDriver: PgDriverService
  let envService: EnvService

  let deliveryPersonRoCol1: DeliveryPerson
  let deliveryPersonRoCol2: DeliveryPerson

  let recipients: {
    johnRoColAngeRecipient: Recipient
    jerryRoColCarmeRecipient: Recipient
    georgeRoCerAngeRecipient: Recipient
    aneRoCerCarmeRecipient: Recipient
    larryAcColAngeRecipient: Recipient
    maryAcColJardimRecipient: Recipient
    janeAcCerAngeRecipient: Recipient
    markAcCerJardimRecipient: Recipient
  }

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

    deliveryPersonRoCol1 =
      await deliveryPersonFactory.makePgDriverDeliveryPerson({
        city: 'Cólorado',
        state: 'RO',
      })

    deliveryPersonRoCol2 =
      await deliveryPersonFactory.makePgDriverDeliveryPerson({
        city: 'Cólorado',
        state: 'RO',
      })

    // Recipient Possibilities Relative to John Doe recipient:
    // Equal State, Equal City, Equal District
    // Equal State, Equal City, Not Equal District
    // Equal State, Not Equal City, Equal District
    // Equal State, Not Equal City, Not Equal District
    // Not Equal State, Equal City, Equal District
    // Not Equal State, Equal City, Not Equal District
    // Not Equal State, Not Equal City, Equal District
    // Not Equal State, Not Equal City, Not Equal District

    recipients = {
      // Equal State, Equal City, Equal District
      johnRoColAngeRecipient: await recipientFactory.makePgDriverRecipient({
        name: 'John Doe',
        district: 'Ângelo Angelim',
        city: 'Cólorado',
        state: 'RO',
      }),

      // Equal State, Equal City, Not Equal District
      jerryRoColCarmeRecipient: await recipientFactory.makePgDriverRecipient({
        name: 'Jerry Doe',
        district: 'Carmesin',
        city: 'Cólorado',
        state: 'RO',
      }),

      // Equal State, Not Equal City, Equal District
      georgeRoCerAngeRecipient: await recipientFactory.makePgDriverRecipient({
        name: 'George Doe',
        district: 'Ângelo Angelim',
        city: 'Cérejeiras',
        state: 'RO',
      }),

      // Equal State, Not Equal City, Not Equal District
      aneRoCerCarmeRecipient: await recipientFactory.makePgDriverRecipient({
        name: 'Ane Doe',
        district: 'Carmesin',
        city: 'Cérejeiras',
        state: 'RO',
      }),

      // Not Equal State, Equal City, Equal District
      larryAcColAngeRecipient: await recipientFactory.makePgDriverRecipient({
        name: 'Larry Doe',
        district: 'Ângelo Angelim',
        city: 'Cólorado',
        state: 'AC',
      }),

      // Not Equal State, Equal City, Not Equal District
      maryAcColJardimRecipient: await recipientFactory.makePgDriverRecipient({
        name: 'Mary Doe',
        district: 'Jardim Népol',
        city: 'Cólorado',
        state: 'AC',
      }),

      // Not Equal State, Not Equal City, Equal District
      janeAcCerAngeRecipient: await recipientFactory.makePgDriverRecipient({
        name: 'Jane Doe',
        district: 'Ângelo Angelim',
        city: 'Cérejeiras',
        state: 'AC',
      }),

      // Not Equal State, Not Equal City, Not Equal District
      markAcCerJardimRecipient: await recipientFactory.makePgDriverRecipient({
        name: 'Mark Doe',
        district: 'Jardim Népol',
        city: 'Cérejeiras',
        state: 'AC',
      }),
    }
  })

  beforeEach(async () => {
    await pgDriver.runQuery(
      `DELETE FROM "${envService.get('DATABASE_SCHEMA')}".packages;`,
    )
  })

  test('[GET] /packages/pending', async () => {
    const accessToken = jwt.sign({
      sub: deliveryPersonRoCol1.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    const waintingPkg1 = await packageFactory.makePgDriverPackage({
      recipientId: recipients.johnRoColAngeRecipient.id,
      status: StatusOptions.waiting,
    })

    const waintingPkg2 = await packageFactory.makePgDriverPackage({
      recipientId: recipients.jerryRoColCarmeRecipient.id,
      status: StatusOptions.waiting,
    })

    const withdrewPkg1 = await packageFactory.makePgDriverPackage({
      recipientId: recipients.johnRoColAngeRecipient.id,
      status: StatusOptions.withdrew,
      deliveryPersonId: deliveryPersonRoCol1.id,
    })

    const withdrewPkg2 = await packageFactory.makePgDriverPackage({
      recipientId: recipients.jerryRoColCarmeRecipient.id,
      status: StatusOptions.withdrew,
      deliveryPersonId: deliveryPersonRoCol1.id,
    })

    // Delivery Person Ro Col 1 but status delivered
    await packageFactory.makePgDriverPackage({
      recipientId: recipients.jerryRoColCarmeRecipient.id,
      status: StatusOptions.delivered,
      deliveryPersonId: deliveryPersonRoCol1.id,
    })

    // Other withdrew packages
    await packageFactory.makePgDriverPackage({
      recipientId: recipients.johnRoColAngeRecipient.id,
      status: StatusOptions.withdrew,
      deliveryPersonId: deliveryPersonRoCol2.id,
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipients.jerryRoColCarmeRecipient.id,
      status: StatusOptions.withdrew,
      deliveryPersonId: deliveryPersonRoCol2.id,
    })

    // Other waiting packages
    await packageFactory.makePgDriverPackage({
      recipientId: recipients.aneRoCerCarmeRecipient.id,
      status: StatusOptions.waiting,
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipients.georgeRoCerAngeRecipient.id,
      status: StatusOptions.waiting,
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipients.janeAcCerAngeRecipient.id,
      status: StatusOptions.waiting,
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipients.larryAcColAngeRecipient.id,
      status: StatusOptions.waiting,
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipients.markAcCerJardimRecipient.id,
      status: StatusOptions.waiting,
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipients.maryAcColJardimRecipient.id,
      status: StatusOptions.waiting,
    })

    const response = await request(app.getHttpServer())
      .get('/packages/pending')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.packages).toHaveLength(4)
    expect(response.body).toEqual({
      packages: expect.arrayContaining([
        expect.objectContaining({
          packageId: withdrewPkg1.id.toString(),
          status: StatusOptions.withdrew,
          deliveryPersonId: deliveryPersonRoCol1.id.toString(),
        }),
        expect.objectContaining({
          packageId: withdrewPkg2.id.toString(),
          status: StatusOptions.withdrew,
          deliveryPersonId: deliveryPersonRoCol1.id.toString(),
        }),
        expect.objectContaining({
          packageId: waintingPkg1.id.toString(),
          status: StatusOptions.waiting,
        }),
        expect.objectContaining({
          packageId: waintingPkg2.id.toString(),
          status: StatusOptions.waiting,
        }),
      ]),
    })
  })

  test('[GET] /packages/pending?page=2', async () => {
    const accessToken = jwt.sign({
      sub: deliveryPersonRoCol1.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    for (let i = 0; i < 20; i++) {
      await packageFactory.makePgDriverPackage({
        recipientId: recipients.johnRoColAngeRecipient.id,
        status: StatusOptions.withdrew,
        deliveryPersonId: deliveryPersonRoCol1.id,
      })
    }

    await packageFactory.makePgDriverPackage({
      recipientId: recipients.jerryRoColCarmeRecipient.id,
      status: StatusOptions.waiting,
      description: 'pkg 21',
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipients.jerryRoColCarmeRecipient.id,
      status: StatusOptions.waiting,
      description: 'pkg 22',
    })

    const response = await request(app.getHttpServer())
      .get(`/packages/pending?page=2`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.packages).toHaveLength(2)
    expect(response.body).toEqual({
      packages: expect.arrayContaining([
        expect.objectContaining({
          description: 'pkg 21',
          status: StatusOptions.waiting,
        }),
        expect.objectContaining({
          description: 'pkg 22',
          status: StatusOptions.waiting,
        }),
      ]),
    })
  })

  test('[GET] /packages/pending?page=2&district=angel', async () => {
    const accessToken = jwt.sign({
      sub: deliveryPersonRoCol1.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    const oldDate = new Date('2023-01-01')

    for (let i = 0; i < 20; i++) {
      await packageFactory.makePgDriverPackage({
        recipientId: recipients.johnRoColAngeRecipient.id,
        status: StatusOptions.withdrew,
        deliveryPersonId: deliveryPersonRoCol1.id,
        postedAt: oldDate,
      })
    }

    const waitingPkg1 = await packageFactory.makePgDriverPackage({
      recipientId: recipients.johnRoColAngeRecipient.id,
      status: StatusOptions.waiting,
      description: 'Waiting Package 1',
    })

    const withdrewPkg1 = await packageFactory.makePgDriverPackage({
      recipientId: recipients.johnRoColAngeRecipient.id,
      status: StatusOptions.withdrew,
      description: 'Withdrew Package 1',
      deliveryPersonId: deliveryPersonRoCol1.id,
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipients.jerryRoColCarmeRecipient.id,
      status: StatusOptions.waiting,
    })

    // Delivery Person Ro Col 1 but status delivered
    await packageFactory.makePgDriverPackage({
      recipientId: recipients.jerryRoColCarmeRecipient.id,
      status: StatusOptions.delivered,
      deliveryPersonId: deliveryPersonRoCol1.id,
    })

    // Other withdrew packages
    await packageFactory.makePgDriverPackage({
      recipientId: recipients.johnRoColAngeRecipient.id,
      status: StatusOptions.withdrew,
      deliveryPersonId: deliveryPersonRoCol2.id,
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipients.jerryRoColCarmeRecipient.id,
      status: StatusOptions.withdrew,
      deliveryPersonId: deliveryPersonRoCol2.id,
    })

    // Other waiting packages
    await packageFactory.makePgDriverPackage({
      recipientId: recipients.aneRoCerCarmeRecipient.id,
      status: StatusOptions.waiting,
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipients.georgeRoCerAngeRecipient.id,
      status: StatusOptions.waiting,
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipients.janeAcCerAngeRecipient.id,
      status: StatusOptions.waiting,
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipients.larryAcColAngeRecipient.id,
      status: StatusOptions.waiting,
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipients.markAcCerJardimRecipient.id,
      status: StatusOptions.waiting,
    })

    await packageFactory.makePgDriverPackage({
      recipientId: recipients.maryAcColJardimRecipient.id,
      status: StatusOptions.waiting,
    })

    const response = await request(app.getHttpServer())
      .get(`/packages/pending?page=2&district=angel`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.packages).toHaveLength(2)
    expect(response.body).toEqual({
      packages: expect.arrayContaining([
        expect.objectContaining({
          description: waitingPkg1.description,
          status: StatusOptions.waiting,
        }),
        expect.objectContaining({
          description: withdrewPkg1.description,
          status: StatusOptions.withdrew,
          deliveryPersonId: deliveryPersonRoCol1.id.toString(),
        }),
      ]),
    })
  })

  test('it should receive 403 when user does not have a delivery person role', async () => {
    const deliveryPerson =
      await deliveryPersonFactory.makePgDriverDeliveryPerson()

    const accessToken = jwt.sign({
      sub: deliveryPerson.id.toString(),
      roles: [Role.Admin],
    })

    const response = await request(app.getHttpServer())
      .get('/packages/pending')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(403)
  })
})
