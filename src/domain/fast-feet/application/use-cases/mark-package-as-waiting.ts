import { Either, left, right } from '@/core/types/either'
import { Package } from '../../enterprise/entities/Package'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { PackagesRepository } from '../repositories/packages-repository'
import { PackageStatusNotAllowedError } from './errors/package-status-not-allowed-error'

interface MarkPackageAsWaitingUseCaseRequest {
  id: string
}

type MarkPackageAsWaitingUseCaseResponse = Either<
  ResourceNotFoundError | PackageStatusNotAllowedError,
  {
    pkg: Package
  }
>

export class MarkPackageAsWaitingUseCase {
  constructor(private readonly packagesRepository: PackagesRepository) {}

  async execute({
    id,
  }: MarkPackageAsWaitingUseCaseRequest): Promise<MarkPackageAsWaitingUseCaseResponse> {
    const pkg = await this.packagesRepository.findById(id)

    if (!pkg) {
      return left(new ResourceNotFoundError())
    }

    if (pkg.status !== 'posted' && pkg.status !== 'returned') {
      return left(new PackageStatusNotAllowedError())
    }

    pkg.status = 'waiting'

    await this.packagesRepository.save(pkg)

    return right({
      pkg,
    })
  }
}
