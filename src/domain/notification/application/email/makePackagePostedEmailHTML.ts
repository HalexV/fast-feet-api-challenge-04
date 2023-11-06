import { Status } from '@/core/types/status'

export interface PackagePostedHTMLProps {
  completeAddress: string
  packageDescription: string
  postedAt: Date
  recipientFirstName: string
  status: Status
}

export abstract class MakePackagePostedEmailHTML {
  abstract execute(data: PackagePostedHTMLProps): string
}
