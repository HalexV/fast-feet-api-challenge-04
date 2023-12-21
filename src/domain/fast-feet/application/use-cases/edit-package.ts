import { Either, left, right } from '@/core/types/either'
import { Package } from '../../enterprise/entities/Package'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { PackagesRepository } from '../repositories/packages-repository'
import { Status, StatusOptions } from '@/core/types/status'
import { RecipientsRepository } from '../repositories/recipients-repository'
import { DeliveryPeopleRepository } from '../repositories/delivery-people-repository'
import { PackageStatusNotAllowedError } from './errors/package-status-not-allowed-error'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Injectable } from '@nestjs/common'

interface EditPackageUseCaseRequest {
  id: string
  description: string
  status: Status
  postedAt: Date
  withdrewAt?: Date | null
  deliveredAt?: Date | null
  deliveryPersonId?: string | null
  recipientId: string
}

type EditPackageUseCaseResponse = Either<
  ResourceNotFoundError | PackageStatusNotAllowedError,
  {
    pkg: Package
  }
>
@Injectable()
export class EditPackageUseCase {
  constructor(
    private readonly packagesRepository: PackagesRepository,
    private readonly deliveryPeopleRepository: DeliveryPeopleRepository,
    private readonly recipientsRepository: RecipientsRepository,
  ) {}

  async execute({
    id,
    description,
    status,
    postedAt,
    withdrewAt,
    deliveredAt,
    deliveryPersonId,
    recipientId,
  }: EditPackageUseCaseRequest): Promise<EditPackageUseCaseResponse> {
    const pkg = await this.packagesRepository.findById(id)

    if (!pkg) {
      return left(new ResourceNotFoundError())
    }

    const recipient = await this.recipientsRepository.findById(recipientId)

    if (!recipient) {
      return left(new ResourceNotFoundError())
    }

    if (deliveryPersonId) {
      const deliveryPerson =
        await this.deliveryPeopleRepository.findById(deliveryPersonId)

      if (!deliveryPerson) {
        return left(new ResourceNotFoundError())
      }
    }

    if (!StatusOptions[status]) {
      return left(new PackageStatusNotAllowedError())
    }

    pkg.deliveredAt = deliveredAt ?? null
    pkg.deliveryPersonId = deliveryPersonId
      ? new UniqueEntityId(deliveryPersonId)
      : null
    pkg.description = description
    pkg.postedAt = postedAt
    pkg.recipientId = new UniqueEntityId(recipientId)
    pkg.status = status
    pkg.withdrewAt = withdrewAt ?? null

    pkg.clearEvents()

    await this.packagesRepository.save(pkg)

    return right({
      pkg,
    })
  }
}
