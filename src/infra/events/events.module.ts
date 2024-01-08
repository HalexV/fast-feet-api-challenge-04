import { Module } from '@nestjs/common'
import { RegisterNotificationUseCase } from '@/domain/notification/application/use-cases/register-notification'
import { SendEmailNotificationUseCase } from '@/domain/notification/application/use-cases/send-email-notification'
import { OnPackagePosted } from '@/domain/notification/application/subscribers/on-package-posted'
import { EmailModule } from '../email/email.module'
import { EnvModule } from '../env/env.module'
import { OnPackageDelivered } from '@/domain/notification/application/subscribers/on-package-delivered'

@Module({
  imports: [EmailModule, EnvModule],
  providers: [
    RegisterNotificationUseCase,
    SendEmailNotificationUseCase,
    OnPackagePosted,
    OnPackageDelivered,
  ],
})
export class EventsModule {}
