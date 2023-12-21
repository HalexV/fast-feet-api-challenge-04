import { Either, left, right } from '@/core/types/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { PackagesRepository } from '../repositories/packages-repository'
import { Injectable } from '@nestjs/common'

interface DeletePackageUseCaseRequest {
  id: string
}

type DeletePackageUseCaseResponse = Either<ResourceNotFoundError, null>
@Injectable()
export class DeletePackageUseCase {
  constructor(private readonly packagesRepository: PackagesRepository) {}

  async execute({
    id,
  }: DeletePackageUseCaseRequest): Promise<DeletePackageUseCaseResponse> {
    const pkg = await this.packagesRepository.findById(id)

    if (!pkg) {
      return left(new ResourceNotFoundError())
    }

    await this.packagesRepository.delete(pkg)

    return right(null)
  }
}
