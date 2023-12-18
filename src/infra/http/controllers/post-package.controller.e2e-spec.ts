import { Role } from '@/core/types/role.enum'
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
import { RecipientFactory } from 'test/factories/make-recipient'

describe('Post Package (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let recipientFactory: RecipientFactory
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
      providers: [AdminFactory, RecipientFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    adminFactory = moduleRef.get(AdminFactory)
    recipientFactory = moduleRef.get(RecipientFactory)
    jwt = moduleRef.get(JwtService)
    packagesRepository = moduleRef.get(PackagesRepository)

    await app.init()
  })

  test('[POST] /packages', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    const recipient = await recipientFactory.makePgDriverRecipient()

    const response = await request(app.getHttpServer())
      .post('/packages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        description: 'Some description',
        recipientId: recipient.id.toString(),
      })

    expect(response.statusCode).toBe(201)

    const packageOnDatabase = await packagesRepository.findById(
      response.body.package.id,
    )

    expect(packageOnDatabase).toBeTruthy()
    expect(packageOnDatabase?.status).toBe('posted')
  })

  test('it should receive 403 when user does not have an admin role', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    const response = await request(app.getHttpServer())
      .post('/packages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        description: 'Some description',
        recipientId: 'non-existent-id',
      })

    expect(response.statusCode).toBe(403)
  })
})
