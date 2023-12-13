import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { DeliveryPeopleRepository } from '@/domain/fast-feet/application/repositories/delivery-people-repository'
import {
  DeliveryPerson,
  DeliveryPersonProps,
} from '@/domain/fast-feet/enterprise/entities/DeliveryPerson'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

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

@Injectable()
export class DeliveryPersonFactory {
  constructor(
    private readonly deliveryPeopleRepository: DeliveryPeopleRepository,
  ) {}

  async makePgDriverDeliveryPerson(
    data: Partial<DeliveryPersonProps> = {},
  ): Promise<DeliveryPerson> {
    const deliveryPerson = makeDeliveryPerson(data)

    await this.deliveryPeopleRepository.create(deliveryPerson)

    return deliveryPerson
  }
}
