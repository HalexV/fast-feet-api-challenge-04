import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications-repository'
import { Notification } from '@/domain/notification/enterprise/entities/Notification'

export class InMemoryNotificationsRepository
  implements NotificationsRepository
{
  public items: Notification[] = []

  async create(notification: Notification): Promise<void> {
    this.items.push(notification)
  }

  async save(notification: Notification): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id.toString() === notification.id.toString(),
    )

    this.items[itemIndex] = notification
  }

  async deleteManyByRecipientId(recipientId: string): Promise<void> {
    const notifications = this.items.filter(
      (notification) => notification.recipientId.toString() !== recipientId,
    )

    this.items = notifications
  }
}
