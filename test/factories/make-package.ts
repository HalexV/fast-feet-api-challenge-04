import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Package,
  PackageProps,
} from '@/domain/fast-feet/enterprise/entities/Package'
import { faker } from '@faker-js/faker'

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
