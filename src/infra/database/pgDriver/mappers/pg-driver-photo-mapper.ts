import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Photo } from '@/domain/fast-feet/enterprise/entities/Photo'

interface PgDriverPhoto {
  id: string
  filename: string
  created_at: Date
  package_id: string
}

export class PgDriverPhotoMapper {
  static toDomain(raw: PgDriverPhoto): Photo {
    return Photo.create(
      {
        filename: raw.filename,
        createdAt: raw.created_at,
        packageId: new UniqueEntityId(raw.package_id),
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPgDriver(photo: Photo): PgDriverPhoto {
    return {
      id: photo.id.toString(),
      filename: photo.filename,
      created_at: photo.createdAt,
      package_id: photo.packageId.toString(),
    }
  }
}
