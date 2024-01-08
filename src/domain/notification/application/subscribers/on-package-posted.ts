import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { PackagePostedEvent } from '@/domain/fast-feet/enterprise/events/package-posted-event'
import { RegisterNotificationUseCase } from '../use-cases/register-notification'
import { SendEmailNotificationUseCase } from '../use-cases/send-email-notification'
import { RecipientsRepository } from '@/domain/fast-feet/application/repositories/recipients-repository'
import { MakePackagePostedEmailHTML } from '../email/makePackagePostedEmailHTML'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OnPackagePosted implements EventHandler {
  constructor(
    private readonly recipientsRepository: RecipientsRepository,
    private readonly registerNotification: RegisterNotificationUseCase,
    private readonly sendEmailNotification: SendEmailNotificationUseCase,
    private readonly makePackagePostedEmailHTML: MakePackagePostedEmailHTML,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewPackagePostedNotification.bind(this),
      PackagePostedEvent.name,
    )
  }

  private async sendNewPackagePostedNotification({ pkg }: PackagePostedEvent) {
    const recipient = await this.recipientsRepository.findById(
      pkg.recipientId.toString(),
    )

    if (recipient) {
      const title = 'A new package was posted to be sent to you'

      const completeAddress = `${recipient.address}, ${recipient.district}, ${recipient.city}/${recipient.state}, ${recipient.zipcode}`
      const packageDescription = pkg.description
      const postedAt = pkg.postedAt
      const recipientFirstName = recipient.name.split(' ')[0]
      const status = 'posted'

      const notificationContent = `Hi! ${recipientFirstName}, a package was posted on ${postedAt.toLocaleDateString()} to be sent to you at: ${completeAddress}.`

      const htmlContent = this.makePackagePostedEmailHTML.execute({
        completeAddress,
        packageDescription,
        postedAt,
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
