import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'
import { InMemoryDeliveryPeopleRepository } from 'test/repositories/in-memory-delivery-people-repository'
import { makePackage } from 'test/factories/make-package'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'
import { WithdrawPackageUseCase } from './withdraw-package'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let sut: WithdrawPackageUseCase

describe('Withdraw package', () => {
  beforeEach(() => {
    inMemoryPhotosRepository = new InMemoryPhotosRepository()
    inMemoryPackagesRepository = new InMemoryPackagesRepository(
      inMemoryPhotosRepository,
    )
    inMemoryDeliveryPeopleRepository = new InMemoryDeliveryPeopleRepository()

    sut = new WithdrawPackageUseCase(
      inMemoryPackagesRepository,
      inMemoryDeliveryPeopleRepository,
    )
  })

  it('should be able to withdraw a package', async () => {
    const pkg = makePackage({
      status: 'waiting',
    })
    const deliveryPerson = makeDeliveryPerson()

    await inMemoryPackagesRepository.create(pkg)
    await inMemoryDeliveryPeopleRepository.create(deliveryPerson)

    const result = await sut.execute({
      id: pkg.id.toString(),
      deliveryPersonId: deliveryPerson.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryPackagesRepository.items[0]).toEqual(
        expect.objectContaining({
          status: 'withdrew',
          deliveryPersonId: deliveryPerson.id,
          withdrewAt: expect.any(Date),
        }),
      )
    }
  })

  it('should not be able to withdraw a package that does not exist', async () => {
    const deliveryPerson = makeDeliveryPerson()

    await inMemoryDeliveryPeopleRepository.create(deliveryPerson)

    const result = await sut.execute({
      id: 'non-existent-id',
      deliveryPersonId: deliveryPerson.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })
})
