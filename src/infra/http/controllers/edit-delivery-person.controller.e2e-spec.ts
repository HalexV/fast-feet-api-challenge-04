import { Role } from '@/core/types/role.enum'
import { DeliveryPeopleRepository } from '@/domain/fast-feet/application/repositories/delivery-people-repository'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { EnvModule } from '@/infra/env/env.module'
import { EnvService } from '@/infra/env/env.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AdminFactory } from 'test/factories/make-admin'
import { DeliveryPersonFactory } from 'test/factories/make-delivery-person'

describe('Edit Delivery Person (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let deliveryPersonFactory: DeliveryPersonFactory
  let jwt: JwtService
  let deliveryPeopleRepository: DeliveryPeopleRepository

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
    deliveryPeopleRepository = moduleRef.get(DeliveryPeopleRepository)

    await app.init()
  })

  test('[PUT] /delivery-people/:id', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    const deliveryPerson =
      await deliveryPersonFactory.makePgDriverDeliveryPerson()

    const editedDeliveryPerson = {
      name: 'John Doe',
      email: 'Johndoe@example.com',
      cpf: '00000000005',
      password: 'asdfgh123',
      address: 'Avenue light',
      district: 'Center',
      city: 'Colorado',
      state: 'RO',
      isActive: false,
    }

    const response = await request(app.getHttpServer())
      .put(`/delivery-people/${deliveryPerson.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(editedDeliveryPerson)

    expect(response.statusCode).toBe(200)

    const userOnDatabase =
      await deliveryPeopleRepository.findByCPF('00000000005')

    if (userOnDatabase) {
      const { password, ...editedDeliveryPersonObject } = editedDeliveryPerson

      expect(userOnDatabase).toMatchObject(editedDeliveryPersonObject)
      expect(userOnDatabase.updatedAt).toBeTruthy()
    }
  })

  test('it should receive 403 when user does not have an admin role', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    const response = await request(app.getHttpServer())
      .put('/delivery-people/non-existent-id')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})

    expect(response.statusCode).toBe(403)
  })
})
