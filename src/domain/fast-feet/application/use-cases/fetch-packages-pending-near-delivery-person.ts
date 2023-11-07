import { Either, left, right } from '@/core/types/either'
import { Package } from '../../enterprise/entities/Package'
import { PackagesRepository } from '../repositories/packages-repository'
import { DeliveryPeopleRepository } from '../repositories/delivery-people-repository'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

interface FetchPackagesPendingNearDeliveryPersonUseCaseRequest {
  page: number
  deliveryPersonId: string
  district?: string
}

type FetchPackagesPendingNearDeliveryPersonUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    pkgs: Package[]
  }
>

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
      await this.packagesRepository.findManyPendingByAddressAndDeliveryPersonId(
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
