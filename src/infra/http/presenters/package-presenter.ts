import { Package } from '@/domain/fast-feet/enterprise/entities/Package'
import { PackageResponseModel } from '../controllers/models/responses/package-response-model'

export class PackagePresenter {
  static toHTTP(pkg: Package): PackageResponseModel {
    return {
      id: pkg.id.toString(),
      description: pkg.description,
      postedAt: pkg.postedAt,
      recipientId: pkg.recipientId.toString(),
      status: pkg.status,
      deliveryPersonId: pkg.deliveryPersonId
        ? pkg.deliveryPersonId.toString()
        : undefined,
      deliveredAt: pkg.deliveredAt,
      withdrewAt: pkg.withdrewAt,
      updatedAt: pkg.updatedAt,
    }
  }
}
