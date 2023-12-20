import { Either, left, right } from '@/core/types/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { PackagesRepository } from '../repositories/packages-repository'
import { PackageWithRecipient } from '../../enterprise/entities/value-objects/package-with-recipient'
import { Injectable } from '@nestjs/common'

interface GetPackageUseCaseRequest {
  id: string
}

type GetPackageUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    pkg: PackageWithRecipient
  }
>
@Injectable()
export class GetPackageUseCase {
  constructor(private readonly packagesRepository: PackagesRepository) {}

  async execute({
    id,
  }: GetPackageUseCaseRequest): Promise<GetPackageUseCaseResponse> {
    const pkg = await this.packagesRepository.findByIdWithRecipient(id)

    if (!pkg) {
      return left(new ResourceNotFoundError())
    }

    return right({
      pkg,
    })
  }
}
