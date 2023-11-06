import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'
import { makePackage } from 'test/factories/make-package'
import { ReturnPackageUseCase } from './return-package'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let sut: ReturnPackageUseCase

describe('Return package', () => {
  beforeEach(() => {
    inMemoryPhotosRepository = new InMemoryPhotosRepository()
    inMemoryPackagesRepository = new InMemoryPackagesRepository(
      inMemoryPhotosRepository,
    )

    sut = new ReturnPackageUseCase(inMemoryPackagesRepository)
  })

  it('should be able to return a package', async () => {
    const deliveryPerson = makeDeliveryPerson()

    const pkg = makePackage({
      status: 'withdrew',
      withdrewAt: new Date(),
      deliveryPersonId: deliveryPerson.id,
    })

    await inMemoryPackagesRepository.create(pkg)

    const result = await sut.execute({
      id: pkg.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryPackagesRepository.items[0]).toEqual(
        expect.objectContaining({
          status: 'returned',
          deliveryPersonId: deliveryPerson.id,
          withdrewAt: expect.any(Date),
        }),
      )
    }
  })
})
