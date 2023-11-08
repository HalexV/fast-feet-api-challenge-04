import { setTimeout } from 'node:timers/promises'

import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'
import { makePackage } from 'test/factories/make-package'
import { FetchPackagesPendingNearDeliveryPersonUseCase } from './fetch-packages-pending-near-delivery-person'
import { InMemoryDeliveryPeopleRepository } from 'test/repositories/in-memory-delivery-people-repository'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'
import { makeRecipient } from 'test/factories/make-recipient'
import { DeliveryPerson } from '../../enterprise/entities/DeliveryPerson'
import { Recipient } from '../../enterprise/entities/Recipient'
import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository
let sut: FetchPackagesPendingNearDeliveryPersonUseCase

let deliveryPerson1: DeliveryPerson
let deliveryPerson2: DeliveryPerson
let deliveryPerson3: DeliveryPerson

let recipient1: Recipient
let recipient2: Recipient
let recipient3: Recipient
let recipient4: Recipient

describe('Fetch packages pending near delivery person', () => {
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

    sut = new FetchPackagesPendingNearDeliveryPersonUseCase(
      inMemoryPackagesRepository,
      inMemoryDeliveryPeopleRepository,
    )

    deliveryPerson1 = makeDeliveryPerson({
      city: 'Colorado do Oeste',
      state: 'RO',
      district: 'Center',
    })

    deliveryPerson2 = makeDeliveryPerson({
      city: 'Vilhena',
      state: 'RO',
      district: 'Water Seven',
    })

    deliveryPerson3 = makeDeliveryPerson({
      city: 'Colorado do Oeste',
      state: 'RO',
      district: 'Center',
    })

    recipient1 = makeRecipient({
      city: 'Colorado do Oeste',
      state: 'RO',
      district: 'Center',
    })

    recipient2 = makeRecipient({
      city: 'Colorado do Oeste',
      state: 'RO',
      district: 'South Blue',
    })

    recipient3 = makeRecipient({
      city: 'Vilhena',
      state: 'RO',
      district: 'Water Seven',
    })

    recipient4 = makeRecipient({
      city: 'Vilhena',
      state: 'RR',
      district: 'Water Seven',
    })

    await inMemoryDeliveryPeopleRepository.create(deliveryPerson1)
    await inMemoryDeliveryPeopleRepository.create(deliveryPerson2)
    await inMemoryDeliveryPeopleRepository.create(deliveryPerson3)

    await inMemoryRecipientsRepository.create(recipient1)
    await inMemoryRecipientsRepository.create(recipient2)
    await inMemoryRecipientsRepository.create(recipient3)
    await inMemoryRecipientsRepository.create(recipient4)

    inMemoryPackagesRepository.items = []
  })

  it('should be able to fetch packages pending near delivery person', async () => {
    // Related to delivery person 1

    // Same city, state and district
    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 1',
        status: 'waiting',
        recipientId: recipient1.id,
      }),
    )

    await setTimeout(5)

    // Same city, state and district
    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 2',
        status: 'withdrew',
        recipientId: recipient1.id,
        deliveryPersonId: deliveryPerson1.id,
      }),
    )

    await setTimeout(5)

    // Same city, state and district
    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 3',
        status: 'withdrew',
        recipientId: recipient1.id,
        deliveryPersonId: deliveryPerson3.id,
      }),
    )

    await setTimeout(5)

    // Same city and state and different district
    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 4',
        status: 'waiting',
        recipientId: recipient2.id,
      }),
    )

    await setTimeout(5)

    // Same city and state and different district
    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 5',
        status: 'withdrew',
        recipientId: recipient2.id,
        deliveryPersonId: deliveryPerson1.id,
      }),
    )

    await setTimeout(5)

    // Same city and state and different district
    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 6',
        status: 'withdrew',
        recipientId: recipient2.id,
        deliveryPersonId: deliveryPerson3.id,
      }),
    )

    await setTimeout(5)

    // Same state and different city and district
    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 7',
        status: 'waiting',
        recipientId: recipient3.id,
      }),
    )

    await setTimeout(5)

    // Same state and different city and district
    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 8',
        status: 'withdrew',
        recipientId: recipient3.id,
        deliveryPersonId: deliveryPerson2.id,
      }),
    )

    await setTimeout(5)

    // Different city, state and district
    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 9',
        status: 'waiting',
        recipientId: recipient4.id,
      }),
    )

    const result1 = await sut.execute({
      page: 1,
      deliveryPersonId: deliveryPerson1.id.toString(),
    })

    expect(result1.isRight()).toBeTruthy()
    if (result1.isRight()) {
      expect(result1.value.pkgs).toEqual([
        expect.objectContaining({
          description: 'Package 5',
        }),
        expect.objectContaining({
          description: 'Package 4',
        }),
        expect.objectContaining({
          description: 'Package 2',
        }),
        expect.objectContaining({
          description: 'Package 1',
        }),
      ])
    }

    const result2 = await sut.execute({
      page: 1,
      deliveryPersonId: deliveryPerson2.id.toString(),
    })

    expect(result2.isRight()).toBeTruthy()
    if (result2.isRight()) {
      expect(result2.value.pkgs).toEqual([
        expect.objectContaining({
          description: 'Package 8',
        }),
        expect.objectContaining({
          description: 'Package 7',
        }),
      ])
    }

    const result3 = await sut.execute({
      page: 1,
      deliveryPersonId: deliveryPerson3.id.toString(),
    })

    expect(result3.isRight()).toBeTruthy()
    if (result3.isRight()) {
      expect(result3.value.pkgs).toEqual([
        expect.objectContaining({
          description: 'Package 6',
        }),
        expect.objectContaining({
          description: 'Package 4',
        }),
        expect.objectContaining({
          description: 'Package 3',
        }),
        expect.objectContaining({
          description: 'Package 1',
        }),
      ])
    }
  })

  it('should not be able to fetch packages pending near delivery person when delivery person does not exist', async () => {
    const result = await sut.execute({
      page: 1,
      deliveryPersonId: 'non-existent-id',
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })

  it('should be able to fetch paginated packages pending near delivery person', async () => {
    for (let i = 0; i < 2; i++) {
      await inMemoryPackagesRepository.create(
        makePackage({
          status: 'waiting',
          recipientId: recipient3.id,
        }),
      )
    }

    for (let i = 0; i < 10; i++) {
      await inMemoryPackagesRepository.create(
        makePackage({
          status: 'waiting',
          recipientId: recipient1.id,
        }),
      )
    }

    for (let i = 0; i < 12; i++) {
      await inMemoryPackagesRepository.create(
        makePackage({
          status: 'waiting',
          recipientId: recipient2.id,
        }),
      )
    }

    const result = await sut.execute({
      page: 2,
      deliveryPersonId: deliveryPerson1.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.pkgs).toHaveLength(2)
    }
  })
})
