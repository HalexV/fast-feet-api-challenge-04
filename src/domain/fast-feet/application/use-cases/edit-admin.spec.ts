import { FakeHasher } from 'test/cryptography/fake-hasher'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { EditAdminUseCase } from './edit-admin'
import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { makeAdmin } from 'test/factories/make-admin'
import { AdminAlreadyExistsError } from './errors/admin-already-exists-error'

let inMemoryAdminsRepository: InMemoryAdminsRepository
let fakeHasher: FakeHasher
let sut: EditAdminUseCase

describe('Edit admin', () => {
  beforeEach(() => {
    inMemoryAdminsRepository = new InMemoryAdminsRepository()
    fakeHasher = new FakeHasher()
    sut = new EditAdminUseCase(inMemoryAdminsRepository, fakeHasher)
  })

  it('should be able to edit an admin', async () => {
    const admin = makeAdmin()

    inMemoryAdminsRepository.items.push(admin)

    const result = await sut.execute({
      id: admin.id.toString(),
      name: 'John Doe',
      cpf: admin.cpf,
      password: '12345678',
      email: 'johndoe@example.com',
      address: 'john doe street',
      district: 'center',
      city: 'John Doe City',
      state: 'AC',
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryAdminsRepository.items[0]).toMatchObject({
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
    const admin1 = makeAdmin({
      cpf: '00011122233',
    })

    const admin2 = makeAdmin()

    inMemoryAdminsRepository.items.push(admin1)
    inMemoryAdminsRepository.items.push(admin2)

    const result = await sut.execute({
      id: admin2.id.toString(),
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
      expect(result.value).toBeInstanceOf(AdminAlreadyExistsError)
    }
  })

  it('should not be able to edit an admin that does not exist', async () => {
    const admin = makeAdmin()

    inMemoryAdminsRepository.items.push(admin)

    const result = await sut.execute({
      id: 'non-existent-id',
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
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })
})
