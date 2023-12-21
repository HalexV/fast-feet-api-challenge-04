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
import { PackageFactory } from 'test/factories/make-package'
import { RecipientFactory } from 'test/factories/make-recipient'

describe('Mark Package As Waiting (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let packageFactory: PackageFactory
  let recipientFactory: RecipientFactory
  let packagesRepository: PackagesRepository
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
    packagesRepository = moduleRef.get(PackagesRepository)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PATCH] /packages/:id/mark-as-waiting', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    const recipient = await recipientFactory.makePgDriverRecipient({
      name: 'John Doe',
    })

    const pkg = await packageFactory.makePgDriverPackage({
      recipientId: recipient.id,
    })

    const response = await request(app.getHttpServer())
      .patch(`/packages/${pkg.id.toString()}/mark-as-waiting`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)

    const packageOnDatabase = await packagesRepository.findById(
      pkg.id.toString(),
    )

    expect(packageOnDatabase?.status).toBe(StatusOptions.waiting)
  })

  test('it should receive 403 when user does not have an admin role', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    const response = await request(app.getHttpServer())
      .patch('/packages/non-existent-id/mark-as-waiting')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(403)
  })
})
