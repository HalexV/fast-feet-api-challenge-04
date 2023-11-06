import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { RegisterNotificationUseCase } from '../use-cases/register-notification'
import { SendEmailNotificationUseCase } from '../use-cases/send-email-notification'
import { RecipientsRepository } from '@/domain/fast-feet/application/repositories/recipients-repository'
import { MakePackageDeliveredEmailHTML } from '../email/makePackageDeliveredEmailHTML'
import { PackageDeliveredEvent } from '@/domain/fast-feet/enterprise/events/package-delivered-event'
import { DeliveryPeopleRepository } from '@/domain/fast-feet/application/repositories/delivery-people-repository'
import { PhotosRepository } from '@/domain/fast-feet/application/repositories/photos-repository'

export class OnPackageDelivered implements EventHandler {
  constructor(
    private readonly recipientsRepository: RecipientsRepository,
    private readonly deliveryPeopleRepository: DeliveryPeopleRepository,
    private readonly photosRepository: PhotosRepository,
    private readonly registerNotification: RegisterNotificationUseCase,
    private readonly sendEmailNotification: SendEmailNotificationUseCase,
    private readonly makePackageDeliveredEmailHTML: MakePackageDeliveredEmailHTML,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendPackageDeliveredNotification.bind(this),
      PackageDeliveredEvent.name,
    )
  }

  private async sendPackageDeliveredNotification({
    pkg,
  }: PackageDeliveredEvent) {
    const recipient = await this.recipientsRepository.findById(
      pkg.recipientId.toString(),
    )

    if (!recipient) return
    if (!pkg.deliveryPersonId) return
    if (!pkg.deliveredAt) return

    const deliveryPerson = await this.deliveryPeopleRepository.findById(
      pkg.deliveryPersonId.toString(),
    )

    if (!deliveryPerson) return

    const photo = await this.photosRepository.findByPackageId(pkg.id.toString())

    if (!photo) return

    const title = 'Your package was delivered'

    const completeAddress = `${recipient.address}, ${recipient.district}, ${recipient.city}/${recipient.state}, ${recipient.zipcode}`
    const packageDescription = pkg.description
    const recipientFirstName = recipient.name.split(' ')[0]
    const deliveryPersonName = deliveryPerson.name
    const photoUrl = photo.filename
    const deliveredAt = pkg.deliveredAt
    const status = 'delivered'

    const notificationContent = `Hi! ${recipientFirstName}, your package was delivered to you at: ${completeAddress}, on ${deliveredAt.toLocaleDateString()}, ${deliveredAt.toLocaleTimeString()}.`

    const htmlContent = this.makePackageDeliveredEmailHTML.execute({
      completeAddress,
      deliveryPersonName,
      photoUrl,
      deliveredAt,
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
