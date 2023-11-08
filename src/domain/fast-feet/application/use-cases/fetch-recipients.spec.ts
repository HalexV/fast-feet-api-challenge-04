import { makeRecipient } from 'test/factories/make-recipient'
import { FetchRecipientsUseCase } from './fetch-recipients'
import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let sut: FetchRecipientsUseCase

describe('Fetch recipients', () => {
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
    sut = new FetchRecipientsUseCase(inMemoryRecipientsRepository)
  })

  it('should be able to fetch recipients', async () => {
    await inMemoryRecipientsRepository.create(
      makeRecipient({
        name: 'John Doe',
      }),
    )
    await inMemoryRecipientsRepository.create(
      makeRecipient({
        name: 'Carl Doe',
      }),
    )
    await inMemoryRecipientsRepository.create(
      makeRecipient({
        name: 'Mary Doe',
      }),
    )

    const result = await sut.execute({
      page: 1,
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.recipients).toEqual([
        expect.objectContaining({
          name: 'Carl Doe',
        }),
        expect.objectContaining({
          name: 'John Doe',
        }),
        expect.objectContaining({
          name: 'Mary Doe',
        }),
      ])
    }
  })

  it('should be able to fetch paginated recipients', async () => {
    for (let i = 0; i < 22; i++) {
      await inMemoryRecipientsRepository.create(makeRecipient())
    }

    const result = await sut.execute({
      page: 2,
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.recipients).toHaveLength(2)
    }
  })
})
