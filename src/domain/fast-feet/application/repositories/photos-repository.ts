import { Photo } from '../../enterprise/entities/Photo'

export abstract class PhotosRepository {
  abstract create(photo: Photo): Promise<void>
  abstract save(photo: Photo): Promise<void>
  abstract deleteByPackageId(packageId: string): Promise<void>
}
