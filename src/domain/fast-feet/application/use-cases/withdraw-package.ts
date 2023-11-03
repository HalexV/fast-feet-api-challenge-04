import { Either, left, right } from '@/core/types/either'
import { Package } from '../../enterprise/entities/Package'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { PackagesRepository } from '../repositories/packages-repository'
import { PackageStatusNotAllowedError } from './errors/package-status-not-allowed-error'
import { DeliveryPeopleRepository } from '../repositories/delivery-people-repository'

interface WithdrawPackageUseCaseRequest {
  id: string
  deliveryPersonId: string
}

type WithdrawPackageUseCaseResponse = Either<
  ResourceNotFoundError | PackageStatusNotAllowedError,
  {
    pkg: Package
  }
>

export class WithdrawPackageUseCase {
  constructor(
    private readonly packagesRepository: PackagesRepository,
    private readonly deliveryPeopleRepository: DeliveryPeopleRepository,
  ) {}

  async execute({
    id,
    deliveryPersonId,
  }: WithdrawPackageUseCaseRequest): Promise<WithdrawPackageUseCaseResponse> {
    const pkg = await this.packagesRepository.findById(id)

    if (!pkg) {
      return left(new ResourceNotFoundError())
    }

    const deliveryPerson =
      await this.deliveryPeopleRepository.findById(deliveryPersonId)

    if (!deliveryPerson) {
      return left(new ResourceNotFoundError())
    }

    if (pkg.status !== 'waiting') {
      return left(new PackageStatusNotAllowedError())
    }

    pkg.status = 'withdrew'
    pkg.deliveryPersonId = deliveryPerson.id
    pkg.withdrewAt = new Date()

    await this.packagesRepository.save(pkg)

    return right({
      pkg,
    })
  }
}
