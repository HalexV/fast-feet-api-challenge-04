import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  DeliveryPerson,
  DeliveryPersonProps,
} from '@/domain/fast-feet/enterprise/entities/DeliveryPerson'
import { faker } from '@faker-js/faker'

export function makeDeliveryPerson(
  override: Partial<DeliveryPersonProps> = {},
  id?: UniqueEntityId,
) {
  const deliveryPerson = DeliveryPerson.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      cpf: faker.string.numeric(11),
      district: faker.location.county(),
      state: 'AC',
      ...override,
    },
    id,
  )

  return deliveryPerson
}
