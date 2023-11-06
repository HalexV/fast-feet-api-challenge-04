import { Either, left, right } from '@/core/types/either'
import { Package } from '../../enterprise/entities/Package'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { PackagesRepository } from '../repositories/packages-repository'
import { PackageStatusNotAllowedError } from './errors/package-status-not-allowed-error'

interface ReturnPackageUseCaseRequest {
  id: string
}

type ReturnPackageUseCaseResponse = Either<
  ResourceNotFoundError | PackageStatusNotAllowedError,
  {
    pkg: Package
  }
>

export class ReturnPackageUseCase {
  constructor(private readonly packagesRepository: PackagesRepository) {}

  async execute({
    id,
  }: ReturnPackageUseCaseRequest): Promise<ReturnPackageUseCaseResponse> {
    const pkg = await this.packagesRepository.findById(id)

    if (!pkg) {
      return left(new ResourceNotFoundError())
    }

    if (pkg.status !== 'withdrew') {
      return left(new PackageStatusNotAllowedError())
    }

    pkg.status = 'returned'

    await this.packagesRepository.save(pkg)

    return right({
      pkg,
    })
  }
}
