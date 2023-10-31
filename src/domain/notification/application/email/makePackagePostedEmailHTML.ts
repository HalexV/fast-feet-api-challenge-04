import { Status } from '@/core/types/status'

export interface HTMLProps {
  completeAddress: string
  packageDescription: string
  postedAt: Date
  recipientFirstName: string
  status: Status
}

export abstract class MakePackagePostedEmailHTML {
  abstract execute(data: HTMLProps): string
}
