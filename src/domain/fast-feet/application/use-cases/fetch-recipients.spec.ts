import { makeRecipient } from 'test/factories/make-recipient'
import { FetchRecipientsUseCase } from './fetch-recipients'
import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'

let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let sut: FetchRecipientsUseCase

describe('Fetch recipients', () => {
  beforeEach(() => {
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository()
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
