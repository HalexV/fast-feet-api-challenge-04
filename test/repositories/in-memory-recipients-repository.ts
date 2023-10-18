import { PaginationParams } from '@/core/repositories/pagination-params'
import { RecipientsRepository } from '@/domain/fast-feet/application/repositories/recipients-repository'
import { Recipient } from '@/domain/fast-feet/enterprise/entities/Recipient'
import { InMemoryPackagesRepository } from './in-memory-packages-repository'
import { InMemoryNotificationsRepository } from './in-memory-notifications-repository'

export class InMemoryRecipientsRepository implements RecipientsRepository {
  constructor(
    private readonly packagesRepository: InMemoryPackagesRepository,
    private readonly notificationsRepository: InMemoryNotificationsRepository,
  ) {}

  public items: Recipient[] = []

  async findByEmail(email: string): Promise<Recipient | null> {
    const recipient = this.items.find((recipient) => recipient.email === email)

    if (!recipient) {
      return null
    }

    return recipient
  }

  async findById(id: string): Promise<Recipient | null> {
    const recipient = this.items.find(
      (recipient) => recipient.id.toString() === id,
    )

    if (!recipient) {
      return null
    }

    return recipient
  }

  async findMany({ page }: PaginationParams): Promise<Recipient[]> {
    const compareFn = new Intl.Collator().compare
    const recipients = this.items
      .sort((a, b) => compareFn(a.name, b.name))
      .slice((page - 1) * 20, page * 20)

    return recipients
  }

  async create(recipient: Recipient): Promise<void> {
    this.items.push(recipient)
  }

  async save(recipient: Recipient): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id.toString() === recipient.id.toString(),
    )

    this.items[itemIndex] = recipient
  }

  async delete(recipient: Recipient): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id.toString() === recipient.id.toString(),
    )

    this.items.splice(itemIndex, 1)

    await this.packagesRepository.deleteManyByRecipientId(
      recipient.id.toString(),
    )
    await this.notificationsRepository.deleteManyByRecipientId(
      recipient.id.toString(),
    )
  }
}
