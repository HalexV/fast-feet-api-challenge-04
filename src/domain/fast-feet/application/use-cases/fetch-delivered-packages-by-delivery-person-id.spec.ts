import { setTimeout } from 'node:timers/promises'

import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'
import { makePackage } from 'test/factories/make-package'
import { InMemoryDeliveryPeopleRepository } from 'test/repositories/in-memory-delivery-people-repository'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'
import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { FetchDeliveredPackagesByDeliveryPersonIdUseCase } from './fetch-delivered-packages-by-delivery-person-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { makeRecipient } from 'test/factories/make-recipient'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let sut: FetchDeliveredPackagesByDeliveryPersonIdUseCase

describe('Fetch delivered packages by delivery person', () => {
  beforeEach(async () => {
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository(
      inMemoryPackagesRepository,
      inMemoryNotificationsRepository,
    )

    inMemoryPhotosRepository = new InMemoryPhotosRepository()
    inMemoryPackagesRepository = new InMemoryPackagesRepository(
      inMemoryPhotosRepository,
      inMemoryRecipientsRepository,
    )
    inMemoryDeliveryPeopleRepository = new InMemoryDeliveryPeopleRepository()

    sut = new FetchDeliveredPackagesByDeliveryPersonIdUseCase(
      inMemoryPackagesRepository,
      inMemoryDeliveryPeopleRepository,
    )
  })

  it('should be able to fetch delivered packages by delivery person id', async () => {
    const deliveryPerson = makeDeliveryPerson()
    await inMemoryDeliveryPeopleRepository.create(deliveryPerson)

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
        status: 'waiting',
        recipientId: recipient1.id,
      }),
    )

    await setTimeout(5)

    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 2',
        status: 'withdrew',
        recipientId: recipient1.id,
        deliveryPersonId: new UniqueEntityId('2'),
      }),
    )

    await setTimeout(5)

    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 3',
        status: 'delivered',
        recipientId: recipient1.id,
        deliveryPersonId: deliveryPerson.id,
      }),
    )

    await setTimeout(5)

    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 4',
        status: 'delivered',
        recipientId: recipient1.id,
        deliveryPersonId: new UniqueEntityId('2'),
      }),
    )

    await setTimeout(5)

    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 5',
        status: 'delivered',
        recipientId: recipient2.id,
        deliveryPersonId: deliveryPerson.id,
      }),
    )

    const result = await sut.execute({
      page: 1,
      deliveryPersonId: deliveryPerson.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.pkgs).toEqual([
        expect.objectContaining({
          description: 'Package 5',
          recipient: 'Jerry Doe',
        }),
        expect.objectContaining({
          description: 'Package 3',
          recipient: 'John Doe',
        }),
      ])
    }
  })

  it('should not be able to fetch delivered packages by delivery person id when delivery person does not exist', async () => {
    const result = await sut.execute({
      page: 1,
      deliveryPersonId: 'non-existent-id',
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })

  it('should be able to fetch paginated delivered packages by delivery person id', async () => {
    const deliveryPerson = makeDeliveryPerson()

    await inMemoryDeliveryPeopleRepository.create(deliveryPerson)

    const recipient = makeRecipient()

    await inMemoryRecipientsRepository.create(recipient)

    for (let i = 0; i < 2; i++) {
      await inMemoryPackagesRepository.create(
        makePackage({
          status: 'delivered',
          recipientId: recipient.id,
          deliveryPersonId: new UniqueEntityId('2'),
        }),
      )
    }

    for (let i = 0; i < 22; i++) {
      await inMemoryPackagesRepository.create(
        makePackage({
          status: 'delivered',
          recipientId: recipient.id,
          deliveryPersonId: deliveryPerson.id,
        }),
      )
    }

    const result = await sut.execute({
      page: 2,
      deliveryPersonId: deliveryPerson.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.pkgs).toHaveLength(2)
    }
  })
})
