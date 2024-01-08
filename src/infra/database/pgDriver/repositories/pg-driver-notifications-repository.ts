import { PgDriverService } from '../pgDriver.service'
import { Injectable } from '@nestjs/common'
import { EnvService } from '@/infra/env/env.service'
import { NotificationsRepository } from '@/domain/notification/application/repositories/notifications-repository'
import { Notification } from '@/domain/notification/enterprise/entities/Notification'
import { PgDriverNotificationMapper } from '../mappers/pg-driver-notification-mapper'

@Injectable()
export class PgDriverNotificationsRepository
  implements NotificationsRepository
{
  private readonly schema: string

  constructor(
    private readonly pgDriver: PgDriverService,
    private readonly envService: EnvService,
  ) {
    this.schema = this.envService.get('DATABASE_SCHEMA')
  }

  async create(notification: Notification): Promise<void> {
    const data = PgDriverNotificationMapper.toPgDriver(notification)

    await this.pgDriver.runQuery(
      `
    INSERT INTO "${this.schema}"."notifications" (
      id,
      title,
      content,
      recipient_id,
      created_at
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5
    );
    `,
      [data.id, data.title, data.content, data.recipient_id, data.created_at],
    )
  }

  async findByRecipientId(recipientId: string): Promise<Notification | null> {
    const result = await this.pgDriver.runQuery(
      `
    SELECT * FROM "${this.schema}"."notifications" WHERE recipient_id=$1 LIMIT 1;
    `,
      [recipientId],
    )

    const data = result.rows[0]

    if (!data) return null

    return PgDriverNotificationMapper.toDomain(data)
  }

  async deleteManyByRecipientId(recipientId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
