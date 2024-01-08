import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications-repository'
import { Notification } from '@/domain/notification/enterprise/entities/Notification'

export class InMemoryNotificationsRepository
  implements NotificationsRepository
{
  public items: Notification[] = []

  async create(notification: Notification): Promise<void> {
    this.items.push(notification)
  }

  async findByRecipientId(recipientId: string): Promise<Notification | null> {
    throw new Error('Method not implemented.')
  }

  async deleteManyByRecipientId(recipientId: string): Promise<void> {
    const notifications = this.items.filter(
      (notification) => notification.recipientId.toString() !== recipientId,
    )

    this.items = notifications
  }
}
