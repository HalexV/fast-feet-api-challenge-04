import { Role } from '@/core/types/role.enum'
import { Admin } from '@/domain/fast-feet/enterprise/entities/Admin'
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
import { RecipientFactory } from 'test/factories/make-recipient'

describe('Fetch Recipients (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let recipientFactory: RecipientFactory
  let jwt: JwtService
  let pgDriver: PgDriverService
  let envService: EnvService
  let admin: Admin

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
      providers: [AdminFactory, RecipientFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    adminFactory = moduleRef.get(AdminFactory)
    jwt = moduleRef.get(JwtService)
    recipientFactory = moduleRef.get(RecipientFactory)
    pgDriver = moduleRef.get(PgDriverService)
    envService = moduleRef.get(EnvService)

    await app.init()

    admin = await adminFactory.makePgDriverAdmin({
      cpf: '00000000003',
    })
  })

  beforeEach(async () => {
    await pgDriver.runQuery(
      `DELETE FROM "${envService.get('DATABASE_SCHEMA')}".recipients;`,
    )
  })

  test('[GET] /recipients', async () => {
    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    await recipientFactory.makePgDriverRecipient({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    await recipientFactory.makePgDriverRecipient({
      name: 'Jerry Doe',
      email: 'jerrydoe@example.com',
    })

    const response = await request(app.getHttpServer())
      .get('/recipients')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.recipients).toHaveLength(2)
    expect(response.body).toEqual({
      recipients: expect.arrayContaining([
        expect.objectContaining({
          name: 'John Doe',
          email: 'johndoe@example.com',
        }),
        expect.objectContaining({
          name: 'Jerry Doe',
          email: 'jerrydoe@example.com',
        }),
      ]),
    })
  })

  test('[GET] /recipients?page=2', async () => {
    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    for (let i = 0; i < 20; i++) {
      await recipientFactory.makePgDriverRecipient({
        name: 'Ali Doe',
      })
    }

    await recipientFactory.makePgDriverRecipient({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    await recipientFactory.makePgDriverRecipient({
      name: 'Jerry Doe',
      email: 'jerrydoe@example.com',
    })

    const response = await request(app.getHttpServer())
      .get('/recipients?page=2')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.recipients).toHaveLength(2)
    expect(response.body).toEqual({
      recipients: expect.arrayContaining([
        expect.objectContaining({
          name: 'John Doe',
          email: 'johndoe@example.com',
        }),
        expect.objectContaining({
          name: 'Jerry Doe',
          email: 'jerrydoe@example.com',
        }),
      ]),
    })
  })

  test('it should receive 403 when user does not have an admin role', async () => {
    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    const response = await request(app.getHttpServer())
      .get('/recipients')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(403)
  })
})
