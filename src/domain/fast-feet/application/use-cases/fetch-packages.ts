import { Either, right } from '@/core/types/either'
import { Package } from '../../enterprise/entities/Package'
import { PackagesRepository } from '../repositories/packages-repository'

interface FetchPackagesUseCaseRequest {
  page: number
}

type FetchPackagesUseCaseResponse = Either<
  null,
  {
    pkgs: Package[]
  }
>

export class FetchPackagesUseCase {
  constructor(private readonly packagesRepository: PackagesRepository) {}

  async execute({
    page,
  }: FetchPackagesUseCaseRequest): Promise<FetchPackagesUseCaseResponse> {
    const pkgs = await this.packagesRepository.findMany({
      page,
    })

    return right({
      pkgs,
    })
  }
}
