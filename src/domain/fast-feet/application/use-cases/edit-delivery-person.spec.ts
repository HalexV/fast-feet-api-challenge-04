import { InMemoryDeliveryPeopleRepository } from 'test/repositories/in-memory-delivery-people-repository'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'
import { EditDeliveryPersonUseCase } from './edit-delivery-person'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { DeliveryPersonAlreadyExistsError } from './errors/delivery-person-already-exists-error'

let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let fakeHasher: FakeHasher
let sut: EditDeliveryPersonUseCase

describe('Edit delivery person', () => {
  beforeEach(() => {
    inMemoryDeliveryPeopleRepository = new InMemoryDeliveryPeopleRepository()
    fakeHasher = new FakeHasher()
    sut = new EditDeliveryPersonUseCase(
      inMemoryDeliveryPeopleRepository,
      fakeHasher,
    )
  })

  it('should be able to edit a delivery person', async () => {
    const deliveryPerson = makeDeliveryPerson()

    inMemoryDeliveryPeopleRepository.items.push(deliveryPerson)

    const result = await sut.execute({
      id: deliveryPerson.id.toString(),
      name: 'John Doe',
      cpf: deliveryPerson.cpf,
      password: '12345678',
      email: 'johndoe@example.com',
      address: 'john doe street',
      district: 'center',
      city: 'John Doe City',
      state: 'AC',
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryDeliveryPeopleRepository.items[0]).toMatchObject({
        name: 'John Doe',
        password: await fakeHasher.hash('12345678'),
        email: 'johndoe@example.com',
        address: 'john doe street',
        district: 'center',
        city: 'John Doe City',
        state: 'AC',
      })
    }
  })

  it('should not be able to edit a cpf to another that already exists', async () => {
    const deliveryPerson1 = makeDeliveryPerson({
      cpf: '00011122233',
    })

    const deliveryPerson2 = makeDeliveryPerson()

    inMemoryDeliveryPeopleRepository.items.push(deliveryPerson1)
    inMemoryDeliveryPeopleRepository.items.push(deliveryPerson2)

    const result = await sut.execute({
      id: deliveryPerson2.id.toString(),
      name: 'John Doe',
      cpf: '00011122233',
      password: '12345678',
      email: 'johndoe@example.com',
      address: 'john doe street',
      district: 'center',
      city: 'John Doe City',
      state: 'AC',
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(DeliveryPersonAlreadyExistsError)
    }
  })
})
