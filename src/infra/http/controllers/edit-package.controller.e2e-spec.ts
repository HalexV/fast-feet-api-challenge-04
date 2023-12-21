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
import { AdminFactory } from 'test/factories/make-admin'
import { DeliveryPersonFactory } from 'test/factories/make-delivery-person'
import { PackageFactory } from 'test/factories/make-package'
import { RecipientFactory } from 'test/factories/make-recipient'

describe('Edit Package (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let packageFactory: PackageFactory
  let recipientFactory: RecipientFactory
  let deliveryPersonFactory: DeliveryPersonFactory
  let jwt: JwtService
  let packagesRepository: PackagesRepository

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
      providers: [
        AdminFactory,
        RecipientFactory,
        PackageFactory,
        DeliveryPersonFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    adminFactory = moduleRef.get(AdminFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    packageFactory = moduleRef.get(PackageFactory)
    deliveryPersonFactory = moduleRef.get(DeliveryPersonFactory)
    packagesRepository = moduleRef.get(PackagesRepository)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PUT] /packages/:id', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    const recipient1 = await recipientFactory.makePgDriverRecipient({
      name: 'John Doe',
    })

    const recipient2 = await recipientFactory.makePgDriverRecipient({
      name: 'Jerry Doe',
    })

    const deliveryPerson =
      await deliveryPersonFactory.makePgDriverDeliveryPerson({
        name: 'Larry Doe',
      })

    const pkg = await packageFactory.makePgDriverPackage({
      recipientId: recipient1.id,
    })

    const editedPackage = {
      description: 'Edited description',
      postedAt: new Date('2023-01-01'),
      recipientId: recipient2.id.toString(),
      status: StatusOptions.delivered,
      deliveredAt: new Date('2023-01-03'),
      deliveryPersonId: deliveryPerson.id.toString(),
      withdrewAt: new Date('2023-01-02'),
    }

    const response = await request(app.getHttpServer())
      .put(`/packages/${pkg.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(editedPackage)

    expect(response.statusCode).toBe(200)

    const packageOnDatabase = await packagesRepository.findById(
      pkg.id.toString(),
    )

    const { recipientId, deliveryPersonId, ...editedPackageRest } =
      editedPackage

    expect(packageOnDatabase).toMatchObject(editedPackageRest)
    expect(packageOnDatabase?.recipientId.toString()).toBe(recipientId)
    expect(packageOnDatabase?.deliveryPersonId?.toString()).toBe(
      deliveryPersonId,
    )
    expect(packageOnDatabase?.updatedAt).toBeTruthy()
  })

  test('it should receive 403 when user does not have an admin role', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    const response = await request(app.getHttpServer())
      .put('/packages/non-existent-id')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(403)
  })
})
