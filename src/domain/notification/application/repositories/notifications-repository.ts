import { Notification } from '../../enterprise/entities/Notification'

export abstract class NotificationsRepository {
  abstract create(notification: Notification): Promise<void>
  abstract save(notification: Notification): Promise<void>
  abstract deleteManyByRecipientId(recipientId: string): Promise<void>
}
