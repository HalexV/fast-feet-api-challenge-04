import { Role } from '@/core/types/role.enum'
import { AdminsRepository } from '@/domain/fast-feet/application/repositories/admins-repository'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { EnvModule } from '@/infra/env/env.module'
import { EnvService } from '@/infra/env/env.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'

describe('Register Admin (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let jwt: JwtService
  let adminsRepository: AdminsRepository

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
    jwt = moduleRef.get(JwtService)
    adminsRepository = moduleRef.get(AdminsRepository)

    await app.init()
  })

  test('[POST] /admins', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    const response = await request(app.getHttpServer())
      .post('/admins')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        cpf: '00000000002',
        password: '12345678',
        address: 'avenue 32',
        district: 'center',
        city: 'colorado',
        state: 'RO',
      })

    expect(response.statusCode).toBe(201)

    const userOnDatabase = await adminsRepository.findByCPF('00000000002')

    expect(userOnDatabase).toBeTruthy()
  })

  test('it should receive 403 when user does not have an admin role', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    const response = await request(app.getHttpServer())
      .post('/admins')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        cpf: '00000000002',
        password: '12345678',
        address: 'avenue 32',
        district: 'center',
        city: 'colorado',
        state: 'RO',
      })

    expect(response.statusCode).toBe(403)
  })
})
