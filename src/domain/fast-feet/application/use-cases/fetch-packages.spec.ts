import { setTimeout } from 'node:timers/promises'

import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'
import { FetchPackagesUseCase } from './fetch-packages'
import { makePackage } from 'test/factories/make-package'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let sut: FetchPackagesUseCase

describe('Fetch packages', () => {
  beforeEach(() => {
    inMemoryPhotosRepository = new InMemoryPhotosRepository()
    inMemoryPackagesRepository = new InMemoryPackagesRepository(
      inMemoryPhotosRepository,
    )

    sut = new FetchPackagesUseCase(inMemoryPackagesRepository)
  })

  it('should be able to fetch packages', async () => {
    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 1',
      }),
    )

    await setTimeout(5)

    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 2',
      }),
    )

    await setTimeout(5)

    await inMemoryPackagesRepository.create(
      makePackage({
        description: 'Package 3',
      }),
    )

    const result = await sut.execute({
      page: 1,
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.pkgs).toEqual([
        expect.objectContaining({
          description: 'Package 3',
        }),
        expect.objectContaining({
          description: 'Package 2',
        }),
        expect.objectContaining({
          description: 'Package 1',
        }),
      ])
    }
  })

  it('should be able to fetch paginated packages', async () => {
    for (let i = 0; i < 22; i++) {
      await inMemoryPackagesRepository.create(makePackage())
    }

    const result = await sut.execute({
      page: 2,
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.pkgs).toHaveLength(2)
    }
  })
})
