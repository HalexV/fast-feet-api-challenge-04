import { Role } from '@/core/types/role.enum'
import { RecipientsRepository } from '@/domain/fast-feet/application/repositories/recipients-repository'
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

describe('Edit Recipient (E2E)', () => {
  let app: INestApplication
  let adminFactory: AdminFactory
  let recipientFactory: RecipientFactory
  let jwt: JwtService
  let recipientsRepository: RecipientsRepository

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
    recipientsRepository = moduleRef.get(RecipientsRepository)

    await app.init()
  })

  test('[PUT] /recipients/:id', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.Admin],
    })

    const recipient = await recipientFactory.makePgDriverRecipient()

    const editedRecipient = {
      name: 'John Doe',
      email: 'Johndoe@example.com',
      address: 'Avenue light',
      district: 'Center',
      city: 'Colorado',
      state: 'RO',
      zipcode: '00000000',
    }

    const response = await request(app.getHttpServer())
      .put(`/recipients/${recipient.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(editedRecipient)

    expect(response.statusCode).toBe(200)

    const recipientOnDatabase = await recipientsRepository.findByEmail(
      'Johndoe@example.com',
    )

    if (recipientOnDatabase) {
      expect(recipientOnDatabase).toMatchObject(editedRecipient)
      expect(recipientOnDatabase.updatedAt).toBeTruthy()
    }
  })

  test('it should receive 403 when user does not have an admin role', async () => {
    const admin = await adminFactory.makePgDriverAdmin()

    const accessToken = jwt.sign({
      sub: admin.id.toString(),
      roles: [Role.DeliveryPerson],
    })

    const response = await request(app.getHttpServer())
      .put('/recipients/non-existent-id')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})

    expect(response.statusCode).toBe(403)
  })
})
