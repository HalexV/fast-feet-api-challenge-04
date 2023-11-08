import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { RegisterRecipientUseCase } from './register-recipient'
import { RecipientAlreadyExistsError } from './errors/recipient-already-exists-error'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let sut: RegisterRecipientUseCase

describe('Register recipient', () => {
  beforeEach(() => {
    inMemoryPhotosRepository = new InMemoryPhotosRepository()
    inMemoryPackagesRepository = new InMemoryPackagesRepository(
      inMemoryPhotosRepository,
      inMemoryRecipientsRepository,
    )
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository(
      inMemoryPackagesRepository,
      inMemoryNotificationsRepository,
    )
    sut = new RegisterRecipientUseCase(inMemoryRecipientsRepository)
  })

  it('should be able to register a recipient', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      address: 'john doe street, 450',
      district: 'center',
      city: 'example city',
      state: 'RO',
      zipcode: '11222000',
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryRecipientsRepository.items[0]).toEqual(
        result.value.recipient,
      )
    }
  })

  it('should not be able to register a recipient with same email', async () => {
    await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      address: 'john doe street, 450',
      district: 'center',
      city: 'example city',
      state: 'RO',
      zipcode: '11222000',
    })

    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      address: 'john doe street, 450',
      district: 'center',
      city: 'example city',
      state: 'RO',
      zipcode: '11222000',
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(RecipientAlreadyExistsError)
    }
  })
})
