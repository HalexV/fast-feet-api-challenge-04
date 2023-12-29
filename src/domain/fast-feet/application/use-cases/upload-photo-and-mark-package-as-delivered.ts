import { Either, left, right } from '@/core/types/either'
import { Package } from '../../enterprise/entities/Package'
import { PackagesRepository } from '../repositories/packages-repository'
import { InvalidPhotoTypeError } from './errors/invalid-photo-type-error'
import { Uploader } from '../storage/uploader'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { PackageStatusNotAllowedError } from './errors/package-status-not-allowed-error'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { PhotosRepository } from '../repositories/photos-repository'
import { Photo } from '../../enterprise/entities/Photo'
import { Injectable } from '@nestjs/common'

interface UploadPhotoAndMarkPackageAsDeliveredUseCaseRequest {
  id: string
  deliveryPersonId: string
  filename: string
  fileType: string
  body: Buffer
}

type UploadPhotoAndMarkPackageAsDeliveredUseCaseResponse = Either<
  | ResourceNotFoundError
  | PackageStatusNotAllowedError
  | NotAllowedError
  | InvalidPhotoTypeError,
  {
    pkg: Package
    photo: Photo
  }
>
@Injectable()
export class UploadPhotoAndMarkPackageAsDeliveredUseCase {
  constructor(
    private readonly packagesRepository: PackagesRepository,
    private readonly photosRepository: PhotosRepository,
    private readonly uploader: Uploader,
  ) {}

  async execute({
    id,
    deliveryPersonId,
    filename,
    body,
    fileType,
  }: UploadPhotoAndMarkPackageAsDeliveredUseCaseRequest): Promise<UploadPhotoAndMarkPackageAsDeliveredUseCaseResponse> {
    const pkg = await this.packagesRepository.findById(id)

    if (!pkg) {
      return left(new ResourceNotFoundError())
    }

    if (pkg.status !== 'withdrew') {
      return left(new PackageStatusNotAllowedError())
    }

    if (deliveryPersonId !== pkg.deliveryPersonId?.toString()) {
      return left(new NotAllowedError())
    }

    if (!/^(image\/(jpeg|png))$/.test(fileType)) {
      return left(new InvalidPhotoTypeError(fileType))
    }

    const { url } = await this.uploader.upload({
      filename,
      fileType,
      body,
    })

    const photo = Photo.create({
      filename: url,
      packageId: pkg.id,
    })

    await this.photosRepository.create(photo)

    pkg.status = 'delivered'
    pkg.deliveredAt = new Date()

    await this.packagesRepository.save(pkg)

    return right({
      pkg,
      photo,
    })
  }
}
