import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { PackagesRepository } from '@/domain/fast-feet/application/repositories/packages-repository'
import {
  Package,
  PackageProps,
} from '@/domain/fast-feet/enterprise/entities/Package'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

export function makePackage(
  override: Partial<PackageProps> = {},
  id?: UniqueEntityId,
) {
  const newPackage = Package.create(
    {
      description: faker.lorem.text(),
      recipientId: new UniqueEntityId(faker.string.uuid()),
      ...override,
    },
    id,
  )

  return newPackage
}

@Injectable()
export class PackageFactory {
  constructor(private readonly packagesRepository: PackagesRepository) {}

  async makePgDriverPackage(
    data: Partial<PackageProps> = {},
  ): Promise<Package> {
    const pkg = makePackage(data)

    await this.packagesRepository.create(pkg)

    return pkg
  }
}
