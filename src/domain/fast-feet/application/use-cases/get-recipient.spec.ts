import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { GetRecipientUseCase } from './get-recipient'
import { makeRecipient } from 'test/factories/make-recipient'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let sut: GetRecipientUseCase

describe('Get recipient', () => {
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
    sut = new GetRecipientUseCase(inMemoryRecipientsRepository)
  })

  it('should be able to get a recipient', async () => {
    const recipient = makeRecipient({
      name: 'John Doe',
    })

    await inMemoryRecipientsRepository.create(recipient)

    const result = await sut.execute({
      id: recipient.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.recipient).toMatchObject({
        name: 'John Doe',
      })
    }
  })

  it('should not be able to get a recipient that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existent-id',
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })
})
