import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Notification } from '@/domain/notification/enterprise/entities/Notification'

interface PgDriverNotification {
  id: string
  title: string
  content: string
  created_at: Date
  recipient_id: string
}

export class PgDriverNotificationMapper {
  static toDomain(raw: PgDriverNotification): Notification {
    return Notification.create(
      {
        content: raw.content,
        recipientId: new UniqueEntityId(raw.recipient_id),
        title: raw.title,
        createdAt: raw.created_at,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPgDriver(notification: Notification): PgDriverNotification {
    return {
      id: notification.id.toString(),
      title: notification.title,
      content: notification.content,
      created_at: notification.createdAt,
      recipient_id: notification.recipientId.toString(),
    }
  }
}
