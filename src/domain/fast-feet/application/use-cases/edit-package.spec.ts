import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { makeRecipient } from 'test/factories/make-recipient'
import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { EditPackageUseCase } from './edit-package'
import { InMemoryDeliveryPeopleRepository } from 'test/repositories/in-memory-delivery-people-repository'
import { makePackage } from 'test/factories/make-package'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'

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

    inMemoryPackagesRepository.create(pkg)
    inMemoryRecipientsRepository.create(recipient)
    inMemoryDeliveryPeopleRepository.create(deliveryPerson)

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
})
