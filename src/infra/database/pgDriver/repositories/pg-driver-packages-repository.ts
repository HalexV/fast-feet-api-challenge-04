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
    throw new Error('Method not implemented.')
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
    throw new Error('Method not implemented.')
  }

  async save(pkg: Package): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async deleteManyByRecipientId(recipientId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async delete(pkg: Package): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
