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

describe('Edit Admin (E2E)', () => {
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

  test('[PUT] /admins/:id', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    const editedAdmin = {
      name: 'John Doe',
      email: 'Johndoe@example.com',
      cpf: '00000000005',
      password: 'asdfgh123',
      address: 'Avenue light',
      district: 'Center',
      city: 'Colorado',
      state: 'RO',
    }

    const response = await request(app.getHttpServer())
      .put(`/admins/${admin.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(editedAdmin)

    expect(response.statusCode).toBe(200)

    const userOnDatabase = await adminsRepository.findByCPF('00000000005')

    if (userOnDatabase) {
      const { password, ...editedAdminObject } = editedAdmin

      expect(userOnDatabase).toMatchObject(editedAdminObject)
      expect(userOnDatabase.updatedAt).toBeTruthy()
    }
  })

  test('it should return 403 when an admin try to edit data of another admin', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    const editedAdmin = {
      name: 'John Doe',
      email: 'Johndoe@example.com',
      cpf: '00000000005',
      password: 'asdfgh123',
      address: 'Avenue light',
      district: 'Center',
      city: 'Colorado',
      state: 'RO',
    }

    const response = await request(app.getHttpServer())
      .put(`/admins/another-admin-id`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(editedAdmin)

    expect(response.statusCode).toBe(403)
  })

  test('it should receive 403 when user does not have an admin role', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    const response = await request(app.getHttpServer())
      .put('/admins/non-existent-id')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})

    expect(response.statusCode).toBe(403)
  })
})
