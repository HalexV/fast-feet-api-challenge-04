import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { StatusOptions } from '@/core/types/status'
import { Package } from '@/domain/fast-feet/enterprise/entities/Package'

interface PgDriverPackage {
  id: string
  description: string
  recipient_id: string
  delivered_at?: Date | null
  delivery_person_id?: string | null
  posted_at: Date
  status: string
  updated_at?: Date | null
  withdrew_at?: Date | null
}

export class PgDriverPackageMapper {
  static toDomain(raw: PgDriverPackage): Package {
    return Package.create(
      {
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
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPgDriver(pkg: Package): PgDriverPackage {
    return {
      id: pkg.id.toString(),
      description: pkg.description,
      recipient_id: pkg.recipientId.toString(),
      delivered_at: pkg.deliveredAt,
      delivery_person_id: pkg.deliveryPersonId
        ? pkg.deliveryPersonId.toString()
        : null,
      posted_at: pkg.postedAt,
      status: pkg.status,
      updated_at: pkg.updatedAt,
      withdrew_at: pkg.withdrewAt,
    }
  }
}
