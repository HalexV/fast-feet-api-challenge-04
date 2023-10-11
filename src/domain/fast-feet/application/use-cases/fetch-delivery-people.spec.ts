import { InMemoryDeliveryPeopleRepository } from 'test/repositories/in-memory-delivery-people-repository'
import { FetchDeliveryPeopleUseCase } from './fetch-delivery-people'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'

let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let sut: FetchDeliveryPeopleUseCase

describe('Fetch delivery people', () => {
  beforeEach(() => {
    inMemoryDeliveryPeopleRepository = new InMemoryDeliveryPeopleRepository()
    sut = new FetchDeliveryPeopleUseCase(inMemoryDeliveryPeopleRepository)
  })

  it('should be able to fetch delivery people', async () => {
    await inMemoryDeliveryPeopleRepository.create(
      makeDeliveryPerson({
        name: 'John Doe',
      }),
    )
    await inMemoryDeliveryPeopleRepository.create(
      makeDeliveryPerson({
        name: 'Carl Doe',
      }),
    )
    await inMemoryDeliveryPeopleRepository.create(
      makeDeliveryPerson({
        name: 'Mary Doe',
      }),
    )

    const result = await sut.execute({
      page: 1,
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.deliveryPeople).toEqual([
        expect.objectContaining({
          props: expect.objectContaining({
            name: 'Carl Doe',
          }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({
            name: 'John Doe',
          }),
        }),
        expect.objectContaining({
          props: expect.objectContaining({
            name: 'Mary Doe',
          }),
        }),
      ])
    }
  })
})
