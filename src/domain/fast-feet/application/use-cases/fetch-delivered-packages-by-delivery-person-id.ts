import { Either, left, right } from '@/core/types/either'
import { PackagesRepository } from '../repositories/packages-repository'
import { DeliveryPeopleRepository } from '../repositories/delivery-people-repository'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { PackageWithRecipient } from '../../enterprise/entities/value-objects/package-with-recipient'
import { Injectable } from '@nestjs/common'

interface FetchDeliveredPackagesByDeliveryPersonIdUseCaseRequest {
  page: number
  deliveryPersonId: string
}

type FetchDeliveredPackagesByDeliveryPersonIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    pkgs: PackageWithRecipient[]
  }
>
@Injectable()
export class FetchDeliveredPackagesByDeliveryPersonIdUseCase {
  constructor(
    private readonly packagesRepository: PackagesRepository,
    private readonly deliveryPeopleRepository: DeliveryPeopleRepository,
  ) {}

  async execute({
    page,
    deliveryPersonId,
  }: FetchDeliveredPackagesByDeliveryPersonIdUseCaseRequest): Promise<FetchDeliveredPackagesByDeliveryPersonIdUseCaseResponse> {
    const deliveryPerson =
      await this.deliveryPeopleRepository.findById(deliveryPersonId)

    if (!deliveryPerson) {
      return left(new ResourceNotFoundError())
    }

    const pkgs =
      await this.packagesRepository.findManyDeliveredByDeliveryPersonIdWithRecipient(
        {
          page,
          deliveryPersonId: deliveryPerson.id.toString(),
        },
      )

    return right({
      pkgs,
    })
  }
}
