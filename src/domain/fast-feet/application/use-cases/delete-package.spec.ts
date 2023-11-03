import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'
import { makePackage } from 'test/factories/make-package'
import { DeletePackageUseCase } from './delete-package'
import { makePhoto } from 'test/factories/make-photo'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let sut: DeletePackageUseCase

describe('Delete package', () => {
  beforeEach(() => {
    inMemoryPhotosRepository = new InMemoryPhotosRepository()
    inMemoryPackagesRepository = new InMemoryPackagesRepository(
      inMemoryPhotosRepository,
    )

    sut = new DeletePackageUseCase(inMemoryPackagesRepository)
  })

  it('should be able to delete a package', async () => {
    const pkg = makePackage()
    const photo = makePhoto({
      packageId: pkg.id,
    })

    await inMemoryPackagesRepository.create(pkg)
    await inMemoryPhotosRepository.create(photo)

    const result = await sut.execute({
      id: pkg.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryPackagesRepository.items).toHaveLength(0)
    expect(inMemoryPhotosRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a package that does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existent-id',
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })
})
