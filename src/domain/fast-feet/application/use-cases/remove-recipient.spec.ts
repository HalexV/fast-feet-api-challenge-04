import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { RemoveRecipientUseCase } from './remove-recipient'
import { makeRecipient } from 'test/factories/make-recipient'
import { makePackage } from 'test/factories/make-package'
import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'
import { InMemoryDeliveryPeopleRepository } from 'test/repositories/in-memory-delivery-people-repository'
import { makeNotification } from 'test/factories/make-notification'
import { makePhoto } from 'test/factories/make-photo'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { RemoveRecipientNotAllowedError } from './errors/remove-recipient-not-allowed-error'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let sut: RemoveRecipientUseCase

describe('Remove recipient', () => {
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
    inMemoryDeliveryPeopleRepository = new InMemoryDeliveryPeopleRepository()
    sut = new RemoveRecipientUseCase(
      inMemoryRecipientsRepository,
      inMemoryPackagesRepository,
    )
  })

  it('should be able to remove a recipient', async () => {
    const recipient = makeRecipient()
    await inMemoryRecipientsRepository.create(recipient)

    const deliveryPerson = makeDeliveryPerson()
    await inMemoryDeliveryPeopleRepository.create(deliveryPerson)

    const pkg = makePackage({
      deliveryPersonId: deliveryPerson.id,
      recipientId: recipient.id,
      status: 'delivered',
      deliveredAt: new Date(),
    })
    await inMemoryPackagesRepository.create(pkg)

    const notification = makeNotification({
      recipientId: recipient.id,
    })
    await inMemoryNotificationsRepository.create(notification)

    const photo = makePhoto({
      packageId: pkg.id,
    })
    await inMemoryPhotosRepository.create(photo)

    const result = await sut.execute({
      id: recipient.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryRecipientsRepository.items).toHaveLength(0)
    expect(inMemoryPackagesRepository.items).toHaveLength(0)
    expect(inMemoryNotificationsRepository.items).toHaveLength(0)
    expect(inMemoryPhotosRepository.items).toHaveLength(0)
  })

  it('should not be able to remove a recipient that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existent-id',
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })

  it('should not be able to remove a recipient who has an undelivered package', async () => {
    const recipient = makeRecipient()
    await inMemoryRecipientsRepository.create(recipient)

    const pkg = makePackage({
      recipientId: recipient.id,
    })
    await inMemoryPackagesRepository.create(pkg)

    const result = await sut.execute({
      id: recipient.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(RemoveRecipientNotAllowedError)
    }
  })
})
