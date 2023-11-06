import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { RegisterNotificationUseCase } from '../use-cases/register-notification'
import { SendEmailNotificationUseCase } from '../use-cases/send-email-notification'
import { RecipientsRepository } from '@/domain/fast-feet/application/repositories/recipients-repository'
import { MakePackageWithdrewEmailHTML } from '../email/makePackageWithdrewEmailHTML'
import { PackageWithdrewEvent } from '@/domain/fast-feet/enterprise/events/package-withdrew-event'
import { DeliveryPeopleRepository } from '@/domain/fast-feet/application/repositories/delivery-people-repository'

export class OnPackageWithdrew implements EventHandler {
  constructor(
    private readonly recipientsRepository: RecipientsRepository,
    private readonly deliveryPeopleRepository: DeliveryPeopleRepository,
    private readonly registerNotification: RegisterNotificationUseCase,
    private readonly sendEmailNotification: SendEmailNotificationUseCase,
    private readonly makePackageWithdrewEmailHTML: MakePackageWithdrewEmailHTML,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendPackageWithdrewNotification.bind(this),
      PackageWithdrewEvent.name,
    )
  }

  private async sendPackageWithdrewNotification({ pkg }: PackageWithdrewEvent) {
    const recipient = await this.recipientsRepository.findById(
      pkg.recipientId.toString(),
    )

    if (!recipient) return
    if (!pkg.deliveryPersonId) return

    const deliveryPerson = await this.deliveryPeopleRepository.findById(
      pkg.deliveryPersonId.toString(),
    )

    if (!deliveryPerson) return

    const title = 'Your package was withdrew to be delivered'

    const completeAddress = `${recipient.address}, ${recipient.district}, ${recipient.city}/${recipient.state}, ${recipient.zipcode}`
    const packageDescription = pkg.description
    const recipientFirstName = recipient.name.split(' ')[0]
    const deliveryPersonName = deliveryPerson.name
    const status = 'withdrew'

    const notificationContent = `Hi! ${recipientFirstName}, your package was withdrew to be delivered to you at: ${completeAddress}.`

    const htmlContent = this.makePackageWithdrewEmailHTML.execute({
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
