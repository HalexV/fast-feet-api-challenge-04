import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { RegisterDefaultAdminUseCase } from './register-default-admin'

let inMemoryAdminsRepository: InMemoryAdminsRepository
let fakeHasher: FakeHasher
let sut: RegisterDefaultAdminUseCase

describe('Register Default Admin', () => {
  beforeEach(() => {
    inMemoryAdminsRepository = new InMemoryAdminsRepository()
    fakeHasher = new FakeHasher()
    sut = new RegisterDefaultAdminUseCase(inMemoryAdminsRepository, fakeHasher)
  })

  it('should be able to register a default admin when any admin exists', async () => {
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
    if (result.isRight() && result.value) {
      expect(inMemoryAdminsRepository.items[0]).toEqual(result.value.admin)
    }
  })
})
