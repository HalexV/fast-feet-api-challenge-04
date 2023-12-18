import { Either, left, right } from '@/core/types/either'
import { Package } from '../../enterprise/entities/Package'
import { PackagesRepository } from '../repositories/packages-repository'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { RecipientsRepository } from '../repositories/recipients-repository'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Injectable } from '@nestjs/common'

interface PostPackageUseCaseRequest {
  description: string
  recipientId: string
}

type PostPackageUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    pkg: Package
  }
>
@Injectable()
export class PostPackageUseCase {
  constructor(
    private readonly packagesRepository: PackagesRepository,
    private readonly recipientsRepository: RecipientsRepository,
  ) {}

  async execute({
    description,
    recipientId,
  }: PostPackageUseCaseRequest): Promise<PostPackageUseCaseResponse> {
    const recipient = await this.recipientsRepository.findById(recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError())
    }

    const pkg = Package.create({
      description,
      recipientId: new UniqueEntityId(recipientId),
    })

    await this.packagesRepository.create(pkg)

    return right({
      pkg,
    })
  }
}
