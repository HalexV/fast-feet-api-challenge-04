import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'
import { makePackage } from 'test/factories/make-package'
import { MarkPackageAsWaitingUseCase } from './mark-package-as-waiting'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { PackageStatusNotAllowedError } from './errors/package-status-not-allowed-error'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let sut: MarkPackageAsWaitingUseCase

describe('Mark package as waiting', () => {
  beforeEach(() => {
    inMemoryPhotosRepository = new InMemoryPhotosRepository()
    inMemoryPackagesRepository = new InMemoryPackagesRepository(
      inMemoryPhotosRepository,
    )

    sut = new MarkPackageAsWaitingUseCase(inMemoryPackagesRepository)
  })

  it('should be able to mark a package as waiting', async () => {
    const pkg = makePackage()
    const pkg2 = makePackage({
      status: 'returned',
    })

    await inMemoryPackagesRepository.create(pkg)
    await inMemoryPackagesRepository.create(pkg2)

    const result = await sut.execute({
      id: pkg.id.toString(),
    })

    const result2 = await sut.execute({
      id: pkg2.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(inMemoryPackagesRepository.items[0].status).toBe('waiting')
    }

    expect(result2.isRight()).toBeTruthy()
    if (result2.isRight()) {
      expect(inMemoryPackagesRepository.items[1].status).toBe('waiting')
    }
  })

  it('should not be able to mark a package as waiting when it does not exist', async () => {
    const result = await sut.execute({
      id: 'non-existent-id',
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })

  it('should not be able to mark a package as waiting when its status is not posted or returned', async () => {
    const pkg = makePackage({
      status: 'withdrew',
    })

    await inMemoryPackagesRepository.create(pkg)

    const result = await sut.execute({
      id: pkg.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(PackageStatusNotAllowedError)
    }
  })
})
