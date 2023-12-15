import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { StateOptions } from '@/core/types/state'
import { Recipient } from '@/domain/fast-feet/enterprise/entities/Recipient'

interface PgDriverRecipient {
  id: string
  name: string
  email: string
  address: string
  district: string
  state: string
  city: string
  created_at: Date
  updated_at?: Date | null
  zipcode: string
}

export class PgDriverRecipientMapper {
  static toDomain(raw: PgDriverRecipient): Recipient {
    return Recipient.create(
      {
        name: raw.name,
        email: raw.email,
        address: raw.address,
        district: raw.district,
        state: StateOptions[raw.state],
        city: raw.city,
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
        zipcode: raw.zipcode,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPgDriver(recipient: Recipient): PgDriverRecipient {
    return {
      id: recipient.id.toString(),
      name: recipient.name,
      email: recipient.email,
      address: recipient.address,
      district: recipient.district,
      state: recipient.state,
      city: recipient.city,
      created_at: recipient.createdAt,
      updated_at: recipient.updatedAt,
      zipcode: recipient.zipcode,
    }
  }
}
