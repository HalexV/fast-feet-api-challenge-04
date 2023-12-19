import { setTimeout } from 'node:timers/promises'

import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'
import { FetchPackagesUseCase } from './fetch-packages'
import { makePackage } from 'test/factories/make-package'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { makeRecipient } from 'test/factories/make-recipient'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let sut: FetchPackagesUseCase

describe('Fetch packages', () => {
  beforeEach(() => {
    inMemoryPhotosRepository = new InMemoryPhotosRepository()
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()

    inMemoryRecipientsRepository = new InMemoryRecipientsRepository(
      inMemoryPackagesRepository,
      inMemoryNotificationsRepository,
    )
    inMemoryPackagesRepository = new InMemoryPackagesRepository(
      inMemoryPhotosRepository,
      inMemoryRecipientsRepository,
    )

    sut = new FetchPackagesUseCase(inMemoryPackagesRepository)
  })

  it('should be able to fetch packages', async () => {
    const recipient1 = makeRecipient({
      name: 'John Doe',
    })

    await inMemoryRecipientsRepository.create(recipient1)

    const recipient2 = makeRecipient({
      name: 'Jerry Doe',
    })

    await inMemoryRecipientsRepository.create(recipient2)

    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 1',
        recipientId: recipient1.id,
      }),
    )

    await setTimeout(5)

    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 2',
        recipientId: recipient1.id,
      }),
    )

    await setTimeout(5)

    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 3',
        recipientId: recipient2.id,
      }),
    )

    const result = await sut.execute({
      page: 1,
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.pkgs).toEqual([
        expect.objectContaining({
          description: 'Package 3',
          recipient: 'Jerry Doe',
        }),
        expect.objectContaining({
          description: 'Package 2',
          recipient: 'John Doe',
        }),
        expect.objectContaining({
          description: 'Package 1',
          recipient: 'John Doe',
        }),
      ])
    }
  })

  it('should be able to fetch paginated packages', async () => {
    const recipient = makeRecipient()

    await inMemoryRecipientsRepository.create(recipient)

    for (let i = 0; i < 22; i++) {
      await inMemoryPackagesRepository.create(
        makePackage({
          recipientId: recipient.id,
        }),
      )
    }

    const result = await sut.execute({
      page: 2,
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.pkgs).toHaveLength(2)
    }
  })
})
