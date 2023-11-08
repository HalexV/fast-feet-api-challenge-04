import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { PostPackageUseCase } from './post-package'
import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { makeRecipient } from 'test/factories/make-recipient'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let sut: PostPackageUseCase

describe('Post package', () => {
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
    sut = new PostPackageUseCase(
      inMemoryPackagesRepository,
      inMemoryRecipientsRepository,
    )
  })

  it('should be able to post a package', async () => {
    const recipient = makeRecipient()

    await inMemoryRecipientsRepository.create(recipient)

    const description = `Three packages that contains: a mouse, a keyboard and a headset.`

    const result = await sut.execute({
      description,
      recipientId: recipient.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryPackagesRepository.items[0]).toEqual(result.value.pkg)

      expect(result.value.pkg.status).toBe('posted')

      expect(result.value.pkg.deliveredAt).toBeFalsy()
      expect(result.value.pkg.deliveryPersonId).toBeFalsy()
      expect(result.value.pkg.updatedAt).toBeFalsy()
      expect(result.value.pkg.withdrewAt).toBeFalsy()
    }
  })

  it('should not be able to post a package when recipient does not exist', async () => {
    const description = `Three packages that contains: a mouse, a keyboard and a headset.`

    const result = await sut.execute({
      description,
      recipientId: 'non-existent-id',
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })
})
