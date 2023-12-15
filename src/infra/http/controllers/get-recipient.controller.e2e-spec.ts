import { Role } from '@/core/types/role.enum'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { EnvModule } from '@/infra/env/env.module'
import { EnvService } from '@/infra/env/env.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { RecipientFactory } from 'test/factories/make-recipient'

describe('Get Recipient (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let recipientFactory: RecipientFactory
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
      providers: [AdminFactory, RecipientFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    adminFactory = moduleRef.get(AdminFactory)
    jwt = moduleRef.get(JwtService)
    recipientFactory = moduleRef.get(RecipientFactory)

    await app.init()
  })

  test('[GET] /recipients/:id', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    const recipient = await recipientFactory.makePgDriverRecipient({
      name: 'John Doe',
      email: 'johndoe@example.com',
    })

    const response = await request(app.getHttpServer())
      .get(`/recipients/${recipient.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      recipient: expect.objectContaining({
        name: 'John Doe',
        email: 'johndoe@example.com',
      }),
    })
  })

  test('it should receive 403 when user does not have an admin role', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    const response = await request(app.getHttpServer())
      .get('/recipients/non-existent-id')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(403)
  })
})
