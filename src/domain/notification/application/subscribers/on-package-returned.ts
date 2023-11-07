import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { RegisterNotificationUseCase } from '../use-cases/register-notification'
import { SendEmailNotificationUseCase } from '../use-cases/send-email-notification'
import { RecipientsRepository } from '@/domain/fast-feet/application/repositories/recipients-repository'
import { MakePackageReturnedEmailHTML } from '../email/makePackageReturnedEmailHTML'
import { PackageReturnedEvent } from '@/domain/fast-feet/enterprise/events/package-returned-event'
import { DeliveryPeopleRepository } from '@/domain/fast-feet/application/repositories/delivery-people-repository'

export class OnPackageReturned implements EventHandler {
  constructor(
    private readonly recipientsRepository: RecipientsRepository,
    private readonly deliveryPeopleRepository: DeliveryPeopleRepository,
    private readonly registerNotification: RegisterNotificationUseCase,
    private readonly sendEmailNotification: SendEmailNotificationUseCase,
    private readonly makePackageReturnedEmailHTML: MakePackageReturnedEmailHTML,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendPackageReturnedNotification.bind(this),
      PackageReturnedEvent.name,
    )
  }

  private async sendPackageReturnedNotification({ pkg }: PackageReturnedEvent) {
    const recipient = await this.recipientsRepository.findById(
      pkg.recipientId.toString(),
    )

    if (!recipient) return
    if (!pkg.deliveryPersonId) return

    const deliveryPerson = await this.deliveryPeopleRepository.findById(
      pkg.deliveryPersonId.toString(),
    )

    if (!deliveryPerson) return

    const title = 'Your package was returned'

    const completeAddress = `${recipient.address}, ${recipient.district}, ${recipient.city}/${recipient.state}, ${recipient.zipcode}`
    const packageDescription = pkg.description
    const recipientFirstName = recipient.name.split(' ')[0]
    const deliveryPersonName = deliveryPerson.name
    const status = 'returned'

    const notificationContent = `Hi! ${recipientFirstName}, your package was returned to FastFeet.`

    const htmlContent = this.makePackageReturnedEmailHTML.execute({
      completeAddress,
      deliveryPersonName,
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
