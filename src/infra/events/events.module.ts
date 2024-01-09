import { Module } from '@nestjs/common'
import { RegisterNotificationUseCase } from '@/domain/notification/application/use-cases/register-notification'
import { SendEmailNotificationUseCase } from '@/domain/notification/application/use-cases/send-email-notification'
import { OnPackagePosted } from '@/domain/notification/application/subscribers/on-package-posted'
import { EmailModule } from '../email/email.module'
import { EnvModule } from '../env/env.module'
import { OnPackageDelivered } from '@/domain/notification/application/subscribers/on-package-delivered'
import { OnPackageWaiting } from '@/domain/notification/application/subscribers/on-package-waiting'
import { OnPackageWithdrew } from '@/domain/notification/application/subscribers/on-package-withdrew'

@Module({
  imports: [EmailModule, EnvModule],
  providers: [
    RegisterNotificationUseCase,
    SendEmailNotificationUseCase,
    OnPackagePosted,
    OnPackageWaiting,
    OnPackageWithdrew,
    OnPackageDelivered,
  ],
})
export class EventsModule {}
