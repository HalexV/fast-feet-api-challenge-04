import { PaginationParams } from '@/core/repositories/pagination-params'
import { RecipientsRepository } from '@/domain/fast-feet/application/repositories/recipients-repository'
import { Recipient } from '@/domain/fast-feet/enterprise/entities/Recipient'
import { PgDriverService } from '../pgDriver.service'
import { EnvService } from '@/infra/env/env.service'
import { Injectable } from '@nestjs/common'
import { PgDriverRecipientMapper } from '../mappers/pg-driver-recipient-mapper'

@Injectable()
export class PgDriverRecipientsRepository implements RecipientsRepository {
  private readonly schema: string

  constructor(
    private readonly pgDriver: PgDriverService,
    private readonly envService: EnvService,
  ) {
    this.schema = this.envService.get('DATABASE_SCHEMA')
  }

  async findByEmail(email: string): Promise<Recipient | null> {
    const result = await this.pgDriver.runQuery(
      `
    SELECT * FROM "${this.schema}"."recipients" WHERE email=$1 LIMIT 1;
    `,
      [email],
    )

    const data = result.rows[0]

    if (!data) return null

    return PgDriverRecipientMapper.toDomain(data)
  }

  async findById(id: string): Promise<Recipient | null> {
    const result = await this.pgDriver.runQuery(
      `
    SELECT * FROM "${this.schema}"."recipients" WHERE id=$1 LIMIT 1;
    `,
      [id],
    )

    const data = result.rows[0]

    if (!data) return null

    return PgDriverRecipientMapper.toDomain(data)
  }

  async findMany({ page }: PaginationParams): Promise<Recipient[]> {
    const result = await this.pgDriver.runQuery(
      `
    SELECT * FROM "${this.schema}"."recipients" ORDER BY name ASC LIMIT 20 OFFSET $1;
    `,
      [(page - 1) * 20],
    )

    const data = result.rows

    return data.map(PgDriverRecipientMapper.toDomain)
  }

  async create(recipient: Recipient): Promise<void> {
    const data = PgDriverRecipientMapper.toPgDriver(recipient)

    await this.pgDriver.runQuery(
      `
    INSERT INTO "${this.schema}"."recipients" (
      id,
      name,
      email,
      address,
      district,
      state,
      city,
      created_at,
      updated_at,
      zipcode
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
      $10
    );
    `,
      [
        data.id,
        data.name,
        data.email,
        data.address,
        data.district,
        data.state,
        data.city,
        data.created_at,
        data.updated_at,
        data.zipcode,
      ],
    )
  }

  async save(recipient: Recipient): Promise<void> {
    const data = PgDriverRecipientMapper.toPgDriver(recipient)

    await this.pgDriver.runQuery(
      `
    UPDATE "${this.schema}"."recipients" SET 
      name = $2,
      email = $3,
      address = $4,
      district = $5,
      state = $6,
      city = $7,
      created_at = $8,
      updated_at = $9,
      zipcode = $10
      
    WHERE id=$1;
    `,
      [
        data.id,
        data.name,
        data.email,
        data.address,
        data.district,
        data.state,
        data.city,
        data.created_at,
        data.updated_at,
        data.zipcode,
      ],
    )
  }

  async delete(recipient: Recipient): Promise<void> {
    await this.pgDriver.runQuery(
      `
    DELETE FROM "${this.schema}"."recipients" WHERE id=$1;
    `,
      [recipient.id.toString()],
    )
  }
}
