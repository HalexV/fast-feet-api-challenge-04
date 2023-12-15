import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { RecipientsRepository } from '@/domain/fast-feet/application/repositories/recipients-repository'
import {
  Recipient,
  RecipientProps,
} from '@/domain/fast-feet/enterprise/entities/Recipient'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

export function makeRecipient(
  override: Partial<RecipientProps> = {},
  id?: UniqueEntityId,
) {
  const recipient = Recipient.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      district: faker.location.county(),
      state: 'AC',
      zipcode: faker.string.numeric(8),
      ...override,
    },
    id,
  )

  return recipient
}

@Injectable()
export class RecipientFactory {
  constructor(private readonly recipientsRepository: RecipientsRepository) {}

  async makePgDriverRecipient(
    data: Partial<RecipientProps> = {},
  ): Promise<Recipient> {
    const recipient = makeRecipient(data)

    await this.recipientsRepository.create(recipient)

    return recipient
  }
}
