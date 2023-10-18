import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Notification,
  NotificationProps,
} from '@/domain/notification/enterprise/entities/Notification'
import { faker } from '@faker-js/faker'

export function makeNotification(
  override: Partial<NotificationProps> = {},
  id?: UniqueEntityId,
) {
  const notification = Notification.create(
    {
      title: faker.lorem.sentence(6),
      content: faker.lorem.lines(4),
      recipientId: new UniqueEntityId(faker.string.uuid()),
      ...override,
    },
    id,
  )

  return notification
}
