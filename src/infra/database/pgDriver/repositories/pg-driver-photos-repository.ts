import { PhotosRepository } from '@/domain/fast-feet/application/repositories/photos-repository'
import { Photo } from '@/domain/fast-feet/enterprise/entities/Photo'
import { PgDriverService } from '../pgDriver.service'
import { EnvService } from '@/infra/env/env.service'
import { PgDriverPhotoMapper } from '../mappers/pg-driver-photo-mapper'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PgDriverPhotosRepository implements PhotosRepository {
  private readonly schema: string

  constructor(
    private readonly pgDriver: PgDriverService,
    private readonly envService: EnvService,
  ) {
    this.schema = this.envService.get('DATABASE_SCHEMA')
  }

  async findByPackageId(packageId: string): Promise<Photo | null> {
    const result = await this.pgDriver.runQuery(
      `
    SELECT * FROM "${this.schema}"."photos" WHERE package_id=$1 LIMIT 1;
    `,
      [packageId],
    )

    const data = result.rows[0]

    if (!data) return null

    return PgDriverPhotoMapper.toDomain(data)
  }

  async create(photo: Photo): Promise<void> {
    const data = PgDriverPhotoMapper.toPgDriver(photo)

    await this.pgDriver.runQuery(
      `
    INSERT INTO "${this.schema}"."photos" (
      id,
      filename,
      created_at,
      package_id
    ) VALUES (
      $1,
      $2,
      $3,
      $4
    );
    `,
      [data.id, data.filename, data.created_at, data.package_id],
    )
  }

  async save(photo: Photo): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async deleteByPackageId(packageId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
