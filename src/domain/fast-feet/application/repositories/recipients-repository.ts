import { Recipient } from '../../enterprise/entities/Recipient'

export abstract class RecipientsRepository {
  abstract findByEmail(email: string): Promise<Recipient | null>
  abstract create(recipient: Recipient): Promise<void>
}
