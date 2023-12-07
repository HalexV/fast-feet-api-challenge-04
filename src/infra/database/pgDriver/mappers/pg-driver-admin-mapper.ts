import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { StateOptions } from '@/core/types/state'
import { Admin } from '@/domain/fast-feet/enterprise/entities/Admin'

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
  createdAt: Date
  updatedAt?: Date | null
  roles: role[]
}

export class PgDriverAdminMapper {
  static toDomain(raw: PgDriverUser): Admin {
    return Admin.create(
      {
        name: raw.name,
        email: raw.email,
        cpf: raw.cpf,
        password: raw.password,
        address: raw.address,
        district: raw.district,
        state: StateOptions[raw.state],
        city: raw.city,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPgDriver(admin: Admin): PgDriverUser {
    return {
      id: admin.id.toString(),
      name: admin.name,
      email: admin.email,
      cpf: admin.cpf,
      password: admin.password,
      address: admin.address,
      district: admin.district,
      state: admin.state,
      city: admin.city,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      roles: ['ADMIN'],
    }
  }
}
