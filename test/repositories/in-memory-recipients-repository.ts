import { RecipientsRepository } from '@/domain/fast-feet/application/repositories/recipients-repository'
import { Recipient } from '@/domain/fast-feet/enterprise/entities/Recipient'

export class InMemoryRecipientsRepository implements RecipientsRepository {
  public items: Recipient[] = []

  async findByEmail(email: string): Promise<Recipient | null> {
    const recipient = this.items.find((recipient) => recipient.email === email)

    if (!recipient) {
      return null
    }

    return recipient
  }

  async create(recipient: Recipient): Promise<void> {
    this.items.push(recipient)
  }
}
