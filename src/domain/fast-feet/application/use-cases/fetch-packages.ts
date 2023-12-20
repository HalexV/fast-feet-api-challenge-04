import { Either, right } from '@/core/types/either'
import { PackagesRepository } from '../repositories/packages-repository'
import { PackageWithRecipient } from '../../enterprise/entities/value-objects/package-with-recipient'
import { Injectable } from '@nestjs/common'

interface FetchPackagesUseCaseRequest {
  page: number
}

type FetchPackagesUseCaseResponse = Either<
  null,
  {
    pkgs: PackageWithRecipient[]
  }
>
@Injectable()
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
