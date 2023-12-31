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
    );
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
        data.created_at,
        data.updated_at,
        data.is_active,
        data.roles,
      ],
    )
  }

  async save(deliveryPerson: DeliveryPerson): Promise<void> {
    const data = PgDriverDeliveryPersonMapper.toPgDriver(deliveryPerson)

    await this.pgDriver.runQuery(
      `
    UPDATE "${this.schema}"."users" SET 
      name = $2,
      email = $3,
      cpf = $4,
      password = $5,
      address = $6,
      district = $7,
      state = $8,
      city = $9,
      created_at = $10,
      updated_at = $11,
      is_active = $12,
      roles = $13
      
    WHERE id=$1;
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
        data.created_at,
        data.updated_at,
        data.is_active,
        data.roles,
      ],
    )
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
    const result = await this.pgDriver.runQuery(
      `
    SELECT * FROM "${this.schema}"."users" WHERE id=$1 LIMIT 1;
    `,
      [id],
    )

    const data = result.rows[0]

    if (!data) return null

    return PgDriverDeliveryPersonMapper.toDomain(data)
  }

  async findMany({ page }: PaginationParams): Promise<DeliveryPerson[]> {
    const result = await this.pgDriver.runQuery(
      `
    SELECT * FROM "${this.schema}"."users" WHERE 'DELIVERY_PERSON' = ANY (roles) ORDER BY name ASC LIMIT 20 OFFSET $1;
    `,
      [(page - 1) * 20],
    )

    const data = result.rows

    return data.map(PgDriverDeliveryPersonMapper.toDomain)
  }
}
