import { PaginationParams } from '@/core/repositories/pagination-params'
import {
  FindManyByAddressAndDeliveryPersonIdParams,
  FindManyDeliveredByDeliveryPersonIdParams,
  PackagesRepository,
} from '@/domain/fast-feet/application/repositories/packages-repository'
import { Package } from '@/domain/fast-feet/enterprise/entities/Package'
import { PgDriverService } from '../pgDriver.service'
import { EnvService } from '@/infra/env/env.service'
import { StatusOptions } from '@/core/types/status'
import { PgDriverPackageMapper } from '../mappers/pg-driver-package-mapper'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PgDriverPackagesRepository implements PackagesRepository {
  private readonly schema: string

  constructor(
    private readonly pgDriver: PgDriverService,
    private readonly envService: EnvService,
  ) {
    this.schema = this.envService.get('DATABASE_SCHEMA')
  }

  async findById(id: string): Promise<Package | null> {
    const result = await this.pgDriver.runQuery(
      `
    SELECT * FROM "${this.schema}"."packages" WHERE id=$1 LIMIT 1;
    `,
      [id],
    )

    const data = result.rows[0]

    if (!data) return null

    return PgDriverPackageMapper.toDomain(data)
  }

  async findMany(params: PaginationParams): Promise<Package[]> {
    throw new Error('Method not implemented.')
  }

  async findManyDeliveredByDeliveryPersonId(
    params: FindManyDeliveredByDeliveryPersonIdParams,
  ): Promise<Package[]> {
    throw new Error('Method not implemented.')
  }

  async findManyPendingByAddressAndDeliveryPersonId(
    params: FindManyByAddressAndDeliveryPersonIdParams,
  ): Promise<Package[]> {
    throw new Error('Method not implemented.')
  }

  async findSomeNotDeliveredByRecipientId(
    recipientId: string,
  ): Promise<Package | null> {
    const result = await this.pgDriver.runQuery(
      `
    SELECT * FROM "${this.schema}"."packages" WHERE recipient_id=$1 AND status!='${StatusOptions.delivered}' AND delivered_at IS NULL LIMIT 1;
    `,
      [recipientId],
    )

    const data = result.rows[0]

    if (!data) return null

    return PgDriverPackageMapper.toDomain(data)
  }

  async create(pkg: Package): Promise<void> {
    const data = PgDriverPackageMapper.toPgDriver(pkg)

    await this.pgDriver.runQuery(
      `
    INSERT INTO "${this.schema}"."packages" (
      id,
      description,
      status,
      recipient_id,
      delivery_person_id,
      posted_at,
      withdrew_at,
      delivered_at,
      updated_at
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9
    );
    `,
      [
        data.id,
        data.description,
        data.status,
        data.recipient_id,
        data.delivery_person_id,
        data.posted_at,
        data.withdrew_at,
        data.delivered_at,
        data.updated_at,
      ],
    )
  }

  async save(pkg: Package): Promise<void> {
    const data = PgDriverPackageMapper.toPgDriver(pkg)

    await this.pgDriver.runQuery(
      `
    UPDATE "${this.schema}"."packages" SET 
      description = $2,
      status = $3,
      recipient_id = $4,
      delivery_person_id = $5,
      posted_at = $6,
      withdrew_at = $7,
      delivered_at = $8,
      updated_at = $9,
      
    WHERE id=$1;
    `,
      [
        data.id,
        data.description,
        data.status,
        data.recipient_id,
        data.delivery_person_id,
        data.posted_at,
        data.withdrew_at,
        data.delivered_at,
        data.updated_at,
      ],
    )
  }

  async deleteManyByRecipientId(recipientId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async delete(pkg: Package): Promise<void> {
    await this.pgDriver.runQuery(
      `
    DELETE FROM "${this.schema}"."packages" WHERE id=$1;
    `,
      [pkg.id.toString()],
    )
  }
}