import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { EnvModule } from '@/infra/env/env.module'
import { EnvService } from '@/infra/env/env.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'

describe('Authenticate Admin (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory

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
      providers: [AdminFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    adminFactory = moduleRef.get(AdminFactory)

    await app.init()
  })

  test('[POST] /admin/sessions', async () => {
    await adminFactory.makePgDriverAdmin({
      cpf: '00000000001',
      password: await hash('12345678', 8),
    })

    const response = await request(app.getHttpServer())
      .post('/admin/sessions')
      .send({
        cpf: '00000000001',
        password: '12345678',
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      access_token: expect.any(String),
    })

    const response2 = await request(app.getHttpServer())
      .post('/admin/test')
      .set('Authorization', `Bearer ${response.body.access_token}`)
      .send({
        cpf: '00000000001',
        password: '12345678',
      })

    console.log(response2)
  })
})
