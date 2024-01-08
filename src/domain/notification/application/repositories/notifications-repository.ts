import { Notification } from '../../enterprise/entities/Notification'

export abstract class NotificationsRepository {
  abstract create(notification: Notification): Promise<void>
  abstract findByRecipientId(recipientId: string): Promise<Notification | null>
  abstract deleteManyByRecipientId(recipientId: string): Promise<void>
}
