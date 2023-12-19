import { Either, right } from '@/core/types/either'
import { PackagesRepository } from '../repositories/packages-repository'
import { PackageWithRecipient } from '../../enterprise/entities/value-objects/package-with-recipient'

interface FetchPackagesUseCaseRequest {
  page: number
}

type FetchPackagesUseCaseResponse = Either<
  null,
  {
    pkgs: PackageWithRecipient[]
  }
>

export class FetchPackagesUseCase {
  constructor(private readonly packagesRepository: PackagesRepository) {}

  async execute({
    page,
  }: FetchPackagesUseCaseRequest): Promise<FetchPackagesUseCaseResponse> {
    const pkgs = await this.packagesRepository.findManyWithRecipient({
      page,
    })

    return right({
      pkgs,
    })
  }
}
