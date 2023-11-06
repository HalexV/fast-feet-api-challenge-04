import { Status } from '@/core/types/status'

export interface PackageWithdrewHTMLProps {
  completeAddress: string
  deliveryPersonName: string
  packageDescription: string
  recipientFirstName: string
  status: Status
}

export abstract class MakePackageWithdrewEmailHTML {
  abstract execute(data: PackageWithdrewHTMLProps): string
}
