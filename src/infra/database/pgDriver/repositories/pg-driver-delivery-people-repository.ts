import { PaginationParams } from '@/core/repositories/pagination-params'
import { DeliveryPeopleRepository } from '@/domain/fast-feet/application/repositories/delivery-people-repository'
import { DeliveryPerson } from '@/domain/fast-feet/enterprise/entities/DeliveryPerson'
import { Injectable } from '@nestjs/common'
import { PgDriverService } from '../pgDriver.service'
import { EnvService } from '@/infra/env/env.service'
import { PgDriverDeliveryPersonMapper } from '../mappers/pg-driver-delivery-person-mapper'

@Injectable()
export class PgDriverDeliveryPeopleRepository
  implements DeliveryPeopleRepository
{
  private readonly schema: string

  constructor(
    private readonly pgDriver: PgDriverService,
    private readonly envService: EnvService,
  ) {
    this.schema = this.envService.get('DATABASE_SCHEMA')
  }

  async create(deliveryPerson: DeliveryPerson): Promise<void> {
    const data = PgDriverDeliveryPersonMapper.toPgDriver(deliveryPerson)

    await this.pgDriver.runQuery(
      `
    INSERT INTO "${this.schema}"."users" (
      id,
      name,
      email,
      cpf,
      password,
      address,
      district,
      state,
      city,
      created_at,
      updated_at,
      is_active,
      roles
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11,
      $12,
      $13
    )
    `,
      [
        data.id,
        data.name,
        data.email,
        data.cpf,
        data.password,
        data.address,
        data.district,
        data.state,
        data.city,
        data.createdAt,
        data.updatedAt,
        data.isActive,
        data.roles,
      ],
    )
  }

  async save(deliveryPerson: DeliveryPerson): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async findByCPF(cpf: string): Promise<DeliveryPerson | null> {
    const result = await this.pgDriver.runQuery(
      `
    SELECT * FROM "${this.schema}"."users" WHERE cpf=$1 LIMIT 1;
    `,
      [cpf],
    )

    const data = result.rows[0]

    if (!data) return null

    return PgDriverDeliveryPersonMapper.toDomain(data)
  }

  async findById(id: string): Promise<DeliveryPerson | null> {
    throw new Error('Method not implemented.')
  }

  async findMany(params: PaginationParams): Promise<DeliveryPerson[]> {
    throw new Error('Method not implemented.')
  }
}
