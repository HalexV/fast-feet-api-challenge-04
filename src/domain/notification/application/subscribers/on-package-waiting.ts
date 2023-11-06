import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { RegisterNotificationUseCase } from '../use-cases/register-notification'
import { SendEmailNotificationUseCase } from '../use-cases/send-email-notification'
import { RecipientsRepository } from '@/domain/fast-feet/application/repositories/recipients-repository'
import { MakePackageWaitingEmailHTML } from '../email/makePackageWaitingEmailHTML'
import { PackageWaitingEvent } from '@/domain/fast-feet/enterprise/events/package-waiting-event'

export class OnPackageWaiting implements EventHandler {
  constructor(
    private readonly recipientsRepository: RecipientsRepository,
    private readonly registerNotification: RegisterNotificationUseCase,
    private readonly sendEmailNotification: SendEmailNotificationUseCase,
    private readonly makePackageWaitingEmailHTML: MakePackageWaitingEmailHTML,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendPackageWaitingNotification.bind(this),
      PackageWaitingEvent.name,
    )
  }

  private async sendPackageWaitingNotification({ pkg }: PackageWaitingEvent) {
    const recipient = await this.recipientsRepository.findById(
      pkg.recipientId.toString(),
    )

    if (recipient) {
      const title = 'Your package is waiting to be withdrew'

      const completeAddress = `${recipient.address}, ${recipient.district}, ${recipient.city}/${recipient.state}, ${recipient.zipcode}`
      const packageDescription = pkg.description
      const recipientFirstName = recipient.name.split(' ')[0]
      const status = 'waiting'

      const notificationContent = `Hi! ${recipientFirstName}, your package is waiting to be withdrew to be sent to you at: ${completeAddress}.`

      const htmlContent = this.makePackageWaitingEmailHTML.execute({
        completeAddress,
        packageDescription,
        recipientFirstName,
        status,
      })

      await this.registerNotification.execute({
        title,
        content: notificationContent,
        recipientId: recipient.id.toString(),
      })

      await this.sendEmailNotification.execute({
        title,
        content: htmlContent,
        recipientEmail: recipient.email,
      })
    }
  }
}
