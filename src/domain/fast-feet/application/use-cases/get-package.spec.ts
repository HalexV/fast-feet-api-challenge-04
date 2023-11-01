import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'
import { GetPackageUseCase } from './get-package'
import { makePackage } from 'test/factories/make-package'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let sut: GetPackageUseCase

describe('Get package', () => {
  beforeEach(() => {
    inMemoryPhotosRepository = new InMemoryPhotosRepository()
    inMemoryPackagesRepository = new InMemoryPackagesRepository(
      inMemoryPhotosRepository,
    )

    sut = new GetPackageUseCase(inMemoryPackagesRepository)
  })

  it('should be able to get a package', async () => {
    const pkg = makePackage({
      description: 'Test description',
    })

    await inMemoryPackagesRepository.create(pkg)

    const result = await sut.execute({
      id: pkg.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.pkg).toMatchObject({
        description: 'Test description',
      })
    }
  })
})
