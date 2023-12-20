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
import { PackageFactory } from 'test/factories/make-package'
import { RecipientFactory } from 'test/factories/make-recipient'

describe('Fetch Packages (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let packageFactory: PackageFactory
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
      providers: [AdminFactory, RecipientFactory, PackageFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    adminFactory = moduleRef.get(AdminFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    packageFactory = moduleRef.get(PackageFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /packages', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    const recipient1 = await recipientFactory.makePgDriverRecipient({
      name: 'John Doe',
    })

    const recipient2 = await recipientFactory.makePgDriverRecipient({
      name: 'Mary Doe',
    })

    const pkg1 = await packageFactory.makePgDriverPackage({
      recipientId: recipient1.id,
    })

    const pkg2 = await packageFactory.makePgDriverPackage({
      recipientId: recipient1.id,
    })

    const pkg3 = await packageFactory.makePgDriverPackage({
      recipientId: recipient2.id,
    })

    const pkg4 = await packageFactory.makePgDriverPackage({
      recipientId: recipient2.id,
    })

    const response = await request(app.getHttpServer())
      .get('/packages')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      packages: expect.arrayContaining([
        expect.objectContaining({
          packageId: pkg1.id.toString(),
          description: pkg1.description,
          postedAt: pkg1.postedAt.toISOString(),
          recipient: recipient1.name,
          address: recipient1.address,
          district: recipient1.district,
          city: recipient1.city,
          state: recipient1.state,
          zipcode: recipient1.zipcode,
        }),
        expect.objectContaining({
          packageId: pkg2.id.toString(),
          description: pkg2.description,
          postedAt: pkg2.postedAt.toISOString(),
          recipient: recipient1.name,
          address: recipient1.address,
          district: recipient1.district,
          city: recipient1.city,
          state: recipient1.state,
          zipcode: recipient1.zipcode,
        }),
        expect.objectContaining({
          packageId: pkg3.id.toString(),
          description: pkg3.description,
          postedAt: pkg3.postedAt.toISOString(),
          recipient: recipient2.name,
          address: recipient2.address,
          district: recipient2.district,
          city: recipient2.city,
          state: recipient2.state,
          zipcode: recipient2.zipcode,
        }),
        expect.objectContaining({
          packageId: pkg4.id.toString(),
          description: pkg4.description,
          postedAt: pkg4.postedAt.toISOString(),
          recipient: recipient2.name,
          address: recipient2.address,
          district: recipient2.district,
          city: recipient2.city,
          state: recipient2.state,
          zipcode: recipient2.zipcode,
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
      .get('/packages')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(403)
  })
})
