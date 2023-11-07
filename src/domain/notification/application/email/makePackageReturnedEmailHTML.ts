import { Status } from '@/core/types/status'

export interface PackageReturnedHTMLProps {
  completeAddress: string
  deliveryPersonName: string
  packageDescription: string
  recipientFirstName: string
  status: Status
}

export abstract class MakePackageReturnedEmailHTML {
  abstract execute(data: PackageReturnedHTMLProps): string
}
