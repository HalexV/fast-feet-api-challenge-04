import { PackageWithRecipientResponseModel } from '../controllers/models/responses/package-with-recipient-response-model'
import { PackageWithRecipient } from '@/domain/fast-feet/enterprise/entities/value-objects/package-with-recipient'

export class PackageWithRecipientPresenter {
  static toHTTP(pkg: PackageWithRecipient): PackageWithRecipientResponseModel {
    return {
      packageId: pkg.packageId.toString(),
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
      recipient: pkg.recipient,
      address: pkg.address,
      district: pkg.district,
      city: pkg.city,
      state: pkg.state,
      zipcode: pkg.zipcode,
    }
  }
}
