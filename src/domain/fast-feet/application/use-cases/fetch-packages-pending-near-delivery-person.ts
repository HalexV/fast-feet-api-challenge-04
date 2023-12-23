import { Either, left, right } from '@/core/types/either'
import { PackagesRepository } from '../repositories/packages-repository'
import { DeliveryPeopleRepository } from '../repositories/delivery-people-repository'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { PackageWithRecipient } from '../../enterprise/entities/value-objects/package-with-recipient'
import { Injectable } from '@nestjs/common'

interface FetchPackagesPendingNearDeliveryPersonUseCaseRequest {
  page: number
  deliveryPersonId: string
  district?: string
}

type FetchPackagesPendingNearDeliveryPersonUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    pkgs: PackageWithRecipient[]
  }
>
@Injectable()
export class FetchPackagesPendingNearDeliveryPersonUseCase {
  constructor(
    private readonly packagesRepository: PackagesRepository,
    private readonly deliveryPeopleRepository: DeliveryPeopleRepository,
  ) {}

  async execute({
    page,
    deliveryPersonId,
    district,
  }: FetchPackagesPendingNearDeliveryPersonUseCaseRequest): Promise<FetchPackagesPendingNearDeliveryPersonUseCaseResponse> {
    const deliveryPerson =
      await this.deliveryPeopleRepository.findById(deliveryPersonId)

    if (!deliveryPerson) {
      return left(new ResourceNotFoundError())
    }

    const pkgs =
      await this.packagesRepository.findManyPendingByAddressAndDeliveryPersonIdWithRecipient(
        {
          page,
          deliveryPersonId: deliveryPerson.id.toString(),
          city: deliveryPerson.city,
          state: deliveryPerson.state,
          district,
        },
      )

    return right({
      pkgs,
    })
  }
}
