import { FakeHasher } from 'test/cryptography/fake-hasher'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { WrongCredentialsError } from './errors/wrong-credentials-error'
import { InMemoryDeliveryPeopleRepository } from 'test/repositories/in-memory-delivery-people-repository'
import { AuthenticateDeliveryPersonUseCase } from './authenticate-delivery-person'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'

let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let sut: AuthenticateDeliveryPersonUseCase

describe('Authenticate delivery person', () => {
  beforeEach(() => {
    inMemoryDeliveryPeopleRepository = new InMemoryDeliveryPeopleRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    sut = new AuthenticateDeliveryPersonUseCase(
      inMemoryDeliveryPeopleRepository,
      fakeHasher,
      fakeEncrypter,
    )
  })

  it('should be able to authenticate a delivery person', async () => {
    const deliveryPerson = makeDeliveryPerson({
      cpf: '00011122233',
      password: await fakeHasher.hash('12345678'),
    })

    inMemoryDeliveryPeopleRepository.items.push(deliveryPerson)

    const result = await sut.execute({
      cpf: '00011122233',
      password: '12345678',
    })

    expect(result.isRight()).toBeTruthy()

    if (result.isRight()) {
      expect(result.value).toEqual({
        accessToken: expect.any(String),
      })
    }
  })

  it('should not be able to authenticate a delivery person that does not exist', async () => {
    const deliveryPerson = makeDeliveryPerson({
      cpf: '00011122233',
      password: await fakeHasher.hash('12345678'),
    })

    inMemoryDeliveryPeopleRepository.items.push(deliveryPerson)

    const result = await sut.execute({
      cpf: '00011122234',
      password: '12345678',
    })

    expect(result.isLeft()).toBeTruthy()

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(WrongCredentialsError)
    }
  })

  it('should not be able to authenticate an delivery person with wrong password', async () => {
    const deliveryPerson = makeDeliveryPerson({
      cpf: '00011122233',
      password: await fakeHasher.hash('12345678'),
    })

    inMemoryDeliveryPeopleRepository.items.push(deliveryPerson)

    const result = await sut.execute({
      cpf: '00011122233',
      password: '12345679',
    })

    expect(result.isLeft()).toBeTruthy()

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(WrongCredentialsError)
    }
  })
})
