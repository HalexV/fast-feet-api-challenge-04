import { Either, right } from '@/core/types/either'
import { Notification } from '../../enterprise/entities/Notification'
import { NotificationsRepository } from '../repositories/notifications-repository'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Injectable } from '@nestjs/common'

export interface RegisterNotificationUseCaseRequest {
  title: string
  content: string
  recipientId: string
}

export type RegisterNotificationUseCaseResponse = Either<
  null,
  {
    notification: Notification
  }
>
@Injectable()
export class RegisterNotificationUseCase {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async execute({
    title,
    content,
    recipientId,
  }: RegisterNotificationUseCaseRequest): Promise<RegisterNotificationUseCaseResponse> {
    const notification = Notification.create({
      title,
      content,
      recipientId: new UniqueEntityId(recipientId),
    })

    await this.notificationsRepository.create(notification)

    return right({
      notification,
    })
  }
}
