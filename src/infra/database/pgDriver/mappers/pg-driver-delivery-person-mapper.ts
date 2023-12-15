import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { StateOptions } from '@/core/types/state'
import { DeliveryPerson } from '@/domain/fast-feet/enterprise/entities/DeliveryPerson'

type role = 'ADMIN' | 'DELIVERY_PERSON'

interface PgDriverUser {
  id: string
  name: string
  email: string
  cpf: string
  password: string
  address: string
  district: string
  state: string
  city: string
  created_at: Date
  updated_at?: Date | null
  is_active: boolean
  roles: role[]
}

export class PgDriverDeliveryPersonMapper {
  static toDomain(raw: PgDriverUser): DeliveryPerson {
    return DeliveryPerson.create(
      {
        name: raw.name,
        email: raw.email,
        cpf: raw.cpf,
        password: raw.password,
        address: raw.address,
        district: raw.district,
        state: StateOptions[raw.state],
        city: raw.city,
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
        isActive: raw.is_active,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPgDriver(deliveryPerson: DeliveryPerson): PgDriverUser {
    return {
      id: deliveryPerson.id.toString(),
      name: deliveryPerson.name,
      email: deliveryPerson.email,
      cpf: deliveryPerson.cpf,
      password: deliveryPerson.password,
      address: deliveryPerson.address,
      district: deliveryPerson.district,
      state: deliveryPerson.state,
      city: deliveryPerson.city,
      created_at: deliveryPerson.createdAt,
      updated_at: deliveryPerson.updatedAt,
      is_active: deliveryPerson.isActive,
      roles: ['DELIVERY_PERSON'],
    }
  }
}
