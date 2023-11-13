import { InMemoryDeliveryPeopleRepository } from 'test/repositories/in-memory-delivery-people-repository'
import { TurnAdminIntoDeliveryPersonUseCase } from './turn-admin-into-delivery-person'
import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { makeAdmin } from 'test/factories/make-admin'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let inMemoryAdminsRepository: InMemoryAdminsRepository
let sut: TurnAdminIntoDeliveryPersonUseCase

describe('Turn admin into delivery person', () => {
  beforeEach(() => {
    inMemoryAdminsRepository = new InMemoryAdminsRepository()
    inMemoryDeliveryPeopleRepository = new InMemoryDeliveryPeopleRepository()
    sut = new TurnAdminIntoDeliveryPersonUseCase(
      inMemoryAdminsRepository,
      inMemoryDeliveryPeopleRepository,
    )
  })

  it('should be able to turn an admin into a delivery person', async () => {
    const admin = makeAdmin()

    await inMemoryAdminsRepository.create(admin)

    const result = await sut.execute({
      adminId: admin.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryDeliveryPeopleRepository.items[0]).toEqual(
        result.value.deliveryPerson,
      )
      expect(inMemoryDeliveryPeopleRepository.items[0]).toMatchObject({
        address: admin.address,
        city: admin.city,
        cpf: admin.cpf,
        district: admin.district,
        email: admin.email,
        name: admin.name,
        password: admin.password,
        state: admin.state,
      })
    }
  })

  it('should not be able to turn an admin into a delivery person when admin does not exist', async () => {
    const result = await sut.execute({
      adminId: 'non-existent-id',
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })
})
