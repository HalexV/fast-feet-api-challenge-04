import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { SpyInstance } from 'vitest'
import { InMemoryRecipientsRepository } from 'test/repositories/in-memory-recipients-repository'
import { InMemoryPackagesRepository } from 'test/repositories/in-memory-packages-repository'
import { InMemoryPhotosRepository } from 'test/repositories/in-memory-photos-repository'
import {
  RegisterNotificationUseCase,
  RegisterNotificationUseCaseRequest,
  RegisterNotificationUseCaseResponse,
} from '../use-cases/register-notification'
import {
  SendEmailNotificationUseCase,
  SendEmailNotificationUseCaseRequest,
} from '../use-cases/send-email-notification'
import { FakeEmailer } from 'test/email/fake-emailer'
import { makeRecipient } from 'test/factories/make-recipient'
import { makePackage } from 'test/factories/make-package'
import { waitFor } from 'test/utils/wait-for'
import { InMemoryDeliveryPeopleRepository } from 'test/repositories/in-memory-delivery-people-repository'
import { FakeMakePackageDeliveredEmailHTML } from 'test/email/fake-make-package-delivered-email-html'
import { PackageDeliveredHTMLProps } from '../email/makePackageDeliveredEmailHTML'
import { OnPackageDelivered } from './on-package-delivered'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'
import { makePhoto } from 'test/factories/make-photo'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository

let registerNotificationUseCase: RegisterNotificationUseCase

let fakeEmailer: FakeEmailer
let sendEmailNotificationUseCase: SendEmailNotificationUseCase

let fakeMakePackageDeliveredEmailHTML: FakeMakePackageDeliveredEmailHTML

let registerNotificationExecuteSpy: SpyInstance<
  [RegisterNotificationUseCaseRequest],
  Promise<RegisterNotificationUseCaseResponse>
>

let sendEmailNotificationExecuteSpy: SpyInstance<
  [SendEmailNotificationUseCaseRequest],
  Promise<void>
>

let fakeMakePackageDeliveredEmailHTMLExecuteSpy: SpyInstance<
  [PackageDeliveredHTMLProps],
  string
>

describe('On Package Delivered', () => {
  beforeEach(() => {
    inMemoryPhotosRepository = new InMemoryPhotosRepository()
    inMemoryPackagesRepository = new InMemoryPackagesRepository(
      inMemoryPhotosRepository,
      inMemoryRecipientsRepository,
    )
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    inMemoryRecipientsRepository = new InMemoryRecipientsRepository(
      inMemoryPackagesRepository,
      inMemoryNotificationsRepository,
    )

    inMemoryDeliveryPeopleRepository = new InMemoryDeliveryPeopleRepository()

    registerNotificationUseCase = new RegisterNotificationUseCase(
      inMemoryNotificationsRepository,
    )

    fakeEmailer = new FakeEmailer()

    sendEmailNotificationUseCase = new SendEmailNotificationUseCase(fakeEmailer)

    fakeMakePackageDeliveredEmailHTML = new FakeMakePackageDeliveredEmailHTML()

    registerNotificationExecuteSpy = vi.spyOn(
      registerNotificationUseCase,
      'execute',
    )

    sendEmailNotificationExecuteSpy = vi.spyOn(
      sendEmailNotificationUseCase,
      'execute',
    )

    fakeMakePackageDeliveredEmailHTMLExecuteSpy = vi.spyOn(
      fakeMakePackageDeliveredEmailHTML,
      'execute',
    )

    new OnPackageDelivered(
      inMemoryRecipientsRepository,
      inMemoryDeliveryPeopleRepository,
      inMemoryPhotosRepository,
      registerNotificationUseCase,
      sendEmailNotificationUseCase,
      fakeMakePackageDeliveredEmailHTML,
    )
  })

  it('should send notifications when a package is delivered', async () => {
    const recipient = makeRecipient()
    const deliveryPerson = makeDeliveryPerson()

    const pkg = makePackage({
      recipientId: recipient.id,
      deliveryPersonId: deliveryPerson.id,
      status: 'withdrew',
      withdrewAt: new Date(),
    })

    const photo = makePhoto({
      packageId: pkg.id,
    })

    await inMemoryRecipientsRepository.create(recipient)
    await inMemoryDeliveryPeopleRepository.create(deliveryPerson)
    await inMemoryPackagesRepository.create(pkg)
    await inMemoryPhotosRepository.create(photo)

    pkg.status = 'delivered'
    pkg.deliveredAt = new Date()

    await inMemoryPackagesRepository.save(pkg)

    await waitFor(() => {
      expect(registerNotificationExecuteSpy).toHaveBeenCalled()
      expect(sendEmailNotificationExecuteSpy).toHaveBeenCalled()
      expect(fakeMakePackageDeliveredEmailHTMLExecuteSpy).toHaveBeenCalled()
    })
  })
})
