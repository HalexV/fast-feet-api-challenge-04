import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Photo, PhotoProps } from '@/domain/fast-feet/enterprise/entities/Photo'
import { faker } from '@faker-js/faker'

export function makePhoto(
  override: Partial<PhotoProps> = {},
  id?: UniqueEntityId,
) {
  const photo = Photo.create(
    {
      filename: faker.string.uuid(),
      packageId: new UniqueEntityId(faker.string.uuid()),
      ...override,
    },
    id,
  )

  return photo
}
