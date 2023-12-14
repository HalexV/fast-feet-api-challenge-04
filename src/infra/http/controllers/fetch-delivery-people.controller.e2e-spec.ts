import { Role } from '@/core/types/role.enum'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PgDriverService } from '@/infra/database/pgDriver/pgDriver.service'
import { EnvModule } from '@/infra/env/env.module'
import { EnvService } from '@/infra/env/env.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { DeliveryPersonFactory } from 'test/factories/make-delivery-person'

describe('Fetch Delivery People (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let deliveryPersonFactory: DeliveryPersonFactory
  let jwt: JwtService
  let pgDriver: PgDriverService
  let envService: EnvService

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
      providers: [AdminFactory, DeliveryPersonFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    adminFactory = moduleRef.get(AdminFactory)
    jwt = moduleRef.get(JwtService)
    deliveryPersonFactory = moduleRef.get(DeliveryPersonFactory)
    pgDriver = moduleRef.get(PgDriverService)
    envService = moduleRef.get(EnvService)

    await app.init()
  })

  beforeEach(async () => {
    await pgDriver.runQuery(
      `DELETE FROM "${envService.get('DATABASE_SCHEMA')}".users;`,
    )
  })

  test('[GET] /delivery-people', async () => {
    const admin = await adminFactory.makePgDriverAdmin({
      cpf: '00000000003',
    })

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    await deliveryPersonFactory.makePgDriverDeliveryPerson({
      name: 'John Doe',
      cpf: '00000000001',
    })

    await deliveryPersonFactory.makePgDriverDeliveryPerson({
      name: 'Jerry Doe',
      cpf: '00000000002',
    })

    const response = await request(app.getHttpServer())
      .get('/delivery-people')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.deliveryPeople).toHaveLength(2)
    expect(response.body).toEqual({
      deliveryPeople: expect.arrayContaining([
        expect.objectContaining({
          name: 'John Doe',
          cpf: '00000000001',
        }),
        expect.objectContaining({
          name: 'Jerry Doe',
          cpf: '00000000002',
        }),
      ]),
    })
  })

  test('[GET] /delivery-people?page=2', async () => {
    const admin = await adminFactory.makePgDriverAdmin({
      cpf: '00000000003',
    })

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    for (let i = 0; i < 20; i++) {
      await deliveryPersonFactory.makePgDriverDeliveryPerson({
        name: 'Ali Doe',
      })
    }

    await deliveryPersonFactory.makePgDriverDeliveryPerson({
      name: 'John Doe',
      cpf: '00000000001',
    })

    await deliveryPersonFactory.makePgDriverDeliveryPerson({
      name: 'Jerry Doe',
      cpf: '00000000002',
    })

    const response = await request(app.getHttpServer())
      .get('/delivery-people?page=2')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.deliveryPeople).toHaveLength(2)
    expect(response.body).toEqual({
      deliveryPeople: expect.arrayContaining([
        expect.objectContaining({
          name: 'John Doe',
          cpf: '00000000001',
        }),
        expect.objectContaining({
          name: 'Jerry Doe',
          cpf: '00000000002',
        }),
      ]),
    })
  })

  test('it should receive 403 when user does not have an admin role', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    const response = await request(app.getHttpServer())
      .get('/delivery-people')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(403)
  })
})
