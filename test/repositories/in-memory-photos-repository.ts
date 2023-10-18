import { PhotosRepository } from '@/domain/fast-feet/application/repositories/photos-repository'
import { Photo } from '@/domain/fast-feet/enterprise/entities/Photo'

export class InMemoryPhotosRepository implements PhotosRepository {
  public items: Photo[] = []

  async create(photo: Photo): Promise<void> {
    this.items.push(photo)
  }

  async save(photo: Photo): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id.toString() === photo.id.toString(),
    )

    this.items[itemIndex] = photo
  }

  async deleteByPackageId(packageId: string): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.packageId.toString() === packageId,
    )

    this.items.splice(itemIndex, 1)
  }
}
