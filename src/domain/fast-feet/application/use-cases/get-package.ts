import { Either, left, right } from '@/core/types/either'
import { Package } from '../../enterprise/entities/Package'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { PackagesRepository } from '../repositories/packages-repository'

interface GetPackageUseCaseRequest {
  id: string
}

type GetPackageUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    pkg: Package
  }
>

export class GetPackageUseCase {
  constructor(private readonly packagesRepository: PackagesRepository) {}

  async execute({
    id,
  }: GetPackageUseCaseRequest): Promise<GetPackageUseCaseResponse> {
    const pkg = await this.packagesRepository.findById(id)

    if (!pkg) {
      return left(new ResourceNotFoundError())
    }

    return right({
      pkg,
    })
  }
}
