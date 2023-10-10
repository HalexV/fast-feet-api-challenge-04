import { InMemoryDeliveryPeopleRepository } from 'test/repositories/in-memory-delivery-people-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { RegisterDeliveryPersonUseCase } from './register-delivery-person'

let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let fakeHasher: FakeHasher
let sut: RegisterDeliveryPersonUseCase

describe('Register delivery person', () => {
  beforeEach(() => {
    inMemoryDeliveryPeopleRepository = new InMemoryDeliveryPeopleRepository()
    fakeHasher = new FakeHasher()
    sut = new RegisterDeliveryPersonUseCase(
      inMemoryDeliveryPeopleRepository,
      fakeHasher,
    )
  })

  it('should be able to register a delivery person', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      cpf: '11122233304',
      password: '12345678',
      address: 'john doe street, 450',
      district: 'center',
      city: 'example city',
      state: 'RO',
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryDeliveryPeopleRepository.items[0]).toEqual(
        result.value.deliveryPerson,
      )
    }
  })

  it('should be able to hash delivery person password upon registration', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      cpf: '11122233304',
      password: '12345678',
      address: 'john doe street, 450',
      district: 'center',
      city: 'example city',
      state: 'RO',
    })

    const hashedPassword = await fakeHasher.hash('12345678')

    expect(result.isRight()).toBeTruthy()

    expect(inMemoryDeliveryPeopleRepository.items[0].password).toEqual(
      hashedPassword,
    )
  })
})
