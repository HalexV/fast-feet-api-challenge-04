import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { makeRecipient } from 'test/factories/make-recipient'
import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { EditPackageUseCase } from './edit-package'
import { InMemoryDeliveryPeopleRepository } from 'test/repositories/in-memory-delivery-people-repository'
import { makePackage } from 'test/factories/make-package'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Status } from '@/core/types/status'
import { PackageStatusNotAllowedError } from './errors/package-status-not-allowed-error'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let sut: EditPackageUseCase

describe('Edit package', () => {
  beforeEach(() => {
    inMemoryPhotosRepository = new InMemoryPhotosRepository()
    inMemoryPackagesRepository = new InMemoryPackagesRepository(
      inMemoryPhotosRepository,
      inMemoryRecipientsRepository,
    )
    inMemoryDeliveryPeopleRepository = new InMemoryDeliveryPeopleRepository()
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository(
      inMemoryPackagesRepository,
      inMemoryNotificationsRepository,
    )
    sut = new EditPackageUseCase(
      inMemoryPackagesRepository,
      inMemoryDeliveryPeopleRepository,
      inMemoryRecipientsRepository,
    )
  })

  it('should be able to edit a package', async () => {
    const pkg = makePackage()
    const recipient = makeRecipient()
    const deliveryPerson = makeDeliveryPerson()

    await inMemoryPackagesRepository.create(pkg)
    await inMemoryRecipientsRepository.create(recipient)
    await inMemoryDeliveryPeopleRepository.create(deliveryPerson)

    const postedAtDate = new Date('2023-01-01')
    const withdrewDate = new Date('2023-01-01')
    const deliveredAtDate = new Date('2023-01-07')

    const result = await sut.execute({
      id: pkg.id.toString(),
      description: 'Description edited',
      postedAt: postedAtDate,
      recipientId: recipient.id.toString(),
      status: 'delivered',
      withdrewAt: withdrewDate,
      deliveredAt: deliveredAtDate,
      deliveryPersonId: deliveryPerson.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryPackagesRepository.items[0]).toMatchObject({
        description: 'Description edited',
        postedAt: postedAtDate,
        recipientId: recipient.id,
        status: 'delivered',
        withdrewAt: withdrewDate,
        deliveredAt: deliveredAtDate,
        deliveryPersonId: deliveryPerson.id,
      })
    }
  })

  it('should not be able to edit a package that does not exist', async () => {
    const recipient = makeRecipient()
    const deliveryPerson = makeDeliveryPerson()

    await inMemoryRecipientsRepository.create(recipient)
    await inMemoryDeliveryPeopleRepository.create(deliveryPerson)

    const postedAtDate = new Date('2023-01-01')
    const withdrewDate = new Date('2023-01-01')
    const deliveredAtDate = new Date('2023-01-07')

    const result = await sut.execute({
      id: 'non-existent-id',
      description: 'Description edited',
      postedAt: postedAtDate,
      recipientId: recipient.id.toString(),
      status: 'delivered',
      withdrewAt: withdrewDate,
      deliveredAt: deliveredAtDate,
      deliveryPersonId: deliveryPerson.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })

  it('should not be able to edit a package when recipient does not exist', async () => {
    const pkg = makePackage()
    const deliveryPerson = makeDeliveryPerson()

    await inMemoryPackagesRepository.create(pkg)
    await inMemoryDeliveryPeopleRepository.create(deliveryPerson)

    const postedAtDate = new Date('2023-01-01')
    const withdrewDate = new Date('2023-01-01')
    const deliveredAtDate = new Date('2023-01-07')

    const result = await sut.execute({
      id: pkg.id.toString(),
      description: 'Description edited',
      postedAt: postedAtDate,
      recipientId: 'non-existent-id',
      status: 'delivered',
      withdrewAt: withdrewDate,
      deliveredAt: deliveredAtDate,
      deliveryPersonId: deliveryPerson.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })

  it('should not be able to edit a package when delivery person informed does not exist', async () => {
    const pkg = makePackage()
    const recipient = makeRecipient()

    await inMemoryPackagesRepository.create(pkg)
    await inMemoryRecipientsRepository.create(recipient)

    const postedAtDate = new Date('2023-01-01')
    const withdrewDate = new Date('2023-01-01')
    const deliveredAtDate = new Date('2023-01-07')

    const result = await sut.execute({
      id: pkg.id.toString(),
      description: 'Description edited',
      postedAt: postedAtDate,
      recipientId: recipient.id.toString(),
      status: 'delivered',
      withdrewAt: withdrewDate,
      deliveredAt: deliveredAtDate,
      deliveryPersonId: 'non-existent-id',
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })

  it('should not be able to edit a package with a non-existent status', async () => {
    const pkg = makePackage()
    const recipient = makeRecipient()
    const deliveryPerson = makeDeliveryPerson()

    await inMemoryPackagesRepository.create(pkg)
    await inMemoryRecipientsRepository.create(recipient)
    await inMemoryDeliveryPeopleRepository.create(deliveryPerson)

    const postedAtDate = new Date('2023-01-01')
    const withdrewDate = new Date('2023-01-01')
    const deliveredAtDate = new Date('2023-01-07')

    const result = await sut.execute({
      id: pkg.id.toString(),
      description: 'Description edited',
      postedAt: postedAtDate,
      recipientId: recipient.id.toString(),
      status: 'not-existent' as Status,
      withdrewAt: withdrewDate,
      deliveredAt: deliveredAtDate,
      deliveryPersonId: deliveryPerson.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(PackageStatusNotAllowedError)
    }
  })

  it('should be able to edit a package with only required fields', async () => {
    const pkg = makePackage()
    const recipient = makeRecipient()

    await inMemoryPackagesRepository.create(pkg)
    await inMemoryRecipientsRepository.create(recipient)

    const postedAtDate = new Date('2023-01-01')

    const result = await sut.execute({
      id: pkg.id.toString(),
      description: 'Description edited',
      postedAt: postedAtDate,
      recipientId: recipient.id.toString(),
      status: 'waiting',
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryPackagesRepository.items[0]).toMatchObject({
        description: 'Description edited',
        postedAt: postedAtDate,
        recipientId: recipient.id,
        status: 'waiting',
        withdrewAt: null,
        deliveredAt: null,
        deliveryPersonId: null,
      })
    }
  })
})
