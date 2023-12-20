import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { StateOptions } from '@/core/types/state'
import { StatusOptions } from '@/core/types/status'
import { PackageWithRecipient } from '@/domain/fast-feet/enterprise/entities/value-objects/package-with-recipient'

interface PgDriverPackageWithRecipient {
  id: string
  description: string
  recipient_id: string
  delivered_at?: Date | null
  delivery_person_id?: string | null
  posted_at: Date
  status: string
  updated_at?: Date | null
  withdrew_at?: Date | null
  name: string
  address: string
  district: string
  city: string
  state: string
  zipcode: string
}

export class PgDriverPackageWithRecipientMapper {
  static toDomain(raw: PgDriverPackageWithRecipient): PackageWithRecipient {
    return PackageWithRecipient.create({
      packageId: new UniqueEntityId(raw.id),
      description: raw.description,
      recipientId: new UniqueEntityId(raw.recipient_id),
      deliveredAt: raw.delivered_at,
      deliveryPersonId: raw.delivery_person_id
        ? new UniqueEntityId(raw.delivery_person_id)
        : null,
      postedAt: raw.posted_at,
      status: StatusOptions[raw.status],
      updatedAt: raw.updated_at,
      withdrewAt: raw.withdrew_at,
      recipient: raw.name,
      address: raw.address,
      city: raw.city,
      district: raw.district,
      state: StateOptions[raw.state],
      zipcode: raw.zipcode,
    })
  }
}
