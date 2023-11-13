import { InMemoryDeliveryPeopleRepository } from 'test/repositories/in-memory-delivery-people-repository'
import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { TurnDeliveryPersonIntoAdminUseCase } from './turn-delivery-person-into-admin'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'

let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let inMemoryAdminsRepository: InMemoryAdminsRepository
let sut: TurnDeliveryPersonIntoAdminUseCase

describe('Turn delivery person into admin', () => {
  beforeEach(() => {
    inMemoryAdminsRepository = new InMemoryAdminsRepository()
    inMemoryDeliveryPeopleRepository = new InMemoryDeliveryPeopleRepository()
    sut = new TurnDeliveryPersonIntoAdminUseCase(
      inMemoryAdminsRepository,
      inMemoryDeliveryPeopleRepository,
    )
  })

  it('should be able to turn a delivery person into an admin', async () => {
    const deliveryPerson = makeDeliveryPerson()

    await inMemoryDeliveryPeopleRepository.create(deliveryPerson)

    const result = await sut.execute({
      deliveryPersonId: deliveryPerson.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryAdminsRepository.items[0]).toEqual(result.value.admin)
      expect(inMemoryAdminsRepository.items[0]).toMatchObject({
        address: deliveryPerson.address,
        city: deliveryPerson.city,
        cpf: deliveryPerson.cpf,
        district: deliveryPerson.district,
        email: deliveryPerson.email,
        name: deliveryPerson.name,
        password: deliveryPerson.password,
        state: deliveryPerson.state,
      })
    }
  })

  it('should not be able to turn a delivery person into an admin when delivery person does not exist', async () => {
    const result = await sut.execute({
      deliveryPersonId: 'non-existent-id',
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })
})
