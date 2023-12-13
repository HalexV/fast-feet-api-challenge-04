import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AdminsRepository } from '@/domain/fast-feet/application/repositories/admins-repository'
import { Admin, AdminProps } from '@/domain/fast-feet/enterprise/entities/Admin'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

export function makeAdmin(
  override: Partial<AdminProps> = {},
  id?: UniqueEntityId,
) {
  const admin = Admin.create(
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

  return admin
}

@Injectable()
export class AdminFactory {
  constructor(private readonly adminsRepository: AdminsRepository) {}

  async makePgDriverAdmin(data: Partial<AdminProps> = {}): Promise<Admin> {
    const admin = makeAdmin(data)

    await this.adminsRepository.create(admin)

    return admin
  }
}
