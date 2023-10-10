import { RegisterAdminUseCase } from './register-admin'
import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'

let inMemoryAdminsRepository: InMemoryAdminsRepository
let fakeHasher: FakeHasher
let sut: RegisterAdminUseCase

describe('Register Admin', () => {
  beforeEach(() => {
    inMemoryAdminsRepository = new InMemoryAdminsRepository()
    fakeHasher = new FakeHasher()
    sut = new RegisterAdminUseCase(inMemoryAdminsRepository, fakeHasher)
  })

  it('should be able to register an admin', async () => {
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
      expect(inMemoryAdminsRepository.items[0]).toEqual(result.value.admin)
    }
  })

  it('should be able to hash admin password upon registration', async () => {
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

    expect(inMemoryAdminsRepository.items[0].password).toEqual(hashedPassword)
  })
})
