import { Status } from '@/core/types/status'

export interface PackageWaitingHTMLProps {
  completeAddress: string
  packageDescription: string
  recipientFirstName: string
  status: Status
}

export abstract class MakePackageWaitingEmailHTML {
  abstract execute(data: PackageWaitingHTMLProps): string
}
