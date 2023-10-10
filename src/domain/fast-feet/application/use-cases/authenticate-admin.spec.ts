import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { AuthenticateAdminUseCase } from './authenticate-admin'
import { makeAdmin } from 'test/factories/make-admin'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

let inMemoryAdminsRepository: InMemoryAdminsRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let sut: AuthenticateAdminUseCase

describe('Authenticate admin', () => {
  beforeEach(() => {
    inMemoryAdminsRepository = new InMemoryAdminsRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    sut = new AuthenticateAdminUseCase(
      inMemoryAdminsRepository,
      fakeHasher,
      fakeEncrypter,
    )
  })

  it('should be able to authenticate an admin', async () => {
    const admin = makeAdmin({
      cpf: '00011122233',
      password: await fakeHasher.hash('12345678'),
    })

    inMemoryAdminsRepository.items.push(admin)

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

  it('should not be able to authenticate an admin that does not exist', async () => {
    const admin = makeAdmin({
      cpf: '00011122233',
      password: await fakeHasher.hash('12345678'),
    })

    inMemoryAdminsRepository.items.push(admin)

    const result = await sut.execute({
      cpf: '00011122234',
      password: '12345678',
    })

    expect(result.isLeft()).toBeTruthy()

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(WrongCredentialsError)
    }
  })

  it('should not be able to authenticate an admin with wrong password', async () => {
    const admin = makeAdmin({
      cpf: '00011122233',
      password: await fakeHasher.hash('12345678'),
    })

    inMemoryAdminsRepository.items.push(admin)

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
