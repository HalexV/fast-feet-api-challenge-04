import { InMemoryDeliveryPeopleRepository } from 'test/repositories/in-memory-delivery-people-repository'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'
import { GetDeliveryPersonUseCase } from './get-delivery-person'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let sut: GetDeliveryPersonUseCase

describe('Get delivery person', () => {
  beforeEach(() => {
    inMemoryDeliveryPeopleRepository = new InMemoryDeliveryPeopleRepository()
    sut = new GetDeliveryPersonUseCase(inMemoryDeliveryPeopleRepository)
  })

  it('should be able to get a delivery person', async () => {
    const deliveryPerson = makeDeliveryPerson({
      name: 'John Doe',
    })

    await inMemoryDeliveryPeopleRepository.create(deliveryPerson)

    const result = await sut.execute({
      id: deliveryPerson.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.deliveryPerson).toMatchObject({
        name: 'John Doe',
      })
    }
  })

  it('should not be able to get a delivery person that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existent-id',
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })
})
