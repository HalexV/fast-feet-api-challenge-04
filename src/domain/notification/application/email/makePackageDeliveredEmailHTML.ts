import { Status } from '@/core/types/status'

export interface PackageDeliveredHTMLProps {
  completeAddress: string
  deliveryPersonName: string
  photoUrl: string
  deliveredAt: Date
  packageDescription: string
  recipientFirstName: string
  status: Status
}

export abstract class MakePackageDeliveredEmailHTML {
  abstract execute(data: PackageDeliveredHTMLProps): string
}
