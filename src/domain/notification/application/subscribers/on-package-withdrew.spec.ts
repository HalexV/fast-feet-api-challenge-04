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
import { FakeMakePackageWithdrewEmailHTML } from 'test/email/fake-make-package-withdrew-email-html'
import { PackageWithdrewHTMLProps } from '../email/makePackageWithdrewEmailHTML'
import { OnPackageWithdrew } from './on-package-withdrew'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository

let registerNotificationUseCase: RegisterNotificationUseCase

let fakeEmailer: FakeEmailer
let sendEmailNotificationUseCase: SendEmailNotificationUseCase

let fakeMakePackageWithdrewEmailHTML: FakeMakePackageWithdrewEmailHTML

let registerNotificationExecuteSpy: SpyInstance<
  [RegisterNotificationUseCaseRequest],
  Promise<RegisterNotificationUseCaseResponse>
>

let sendEmailNotificationExecuteSpy: SpyInstance<
  [SendEmailNotificationUseCaseRequest],
  Promise<void>
>

let fakeMakePackageWithdrewEmailHTMLExecuteSpy: SpyInstance<
  [PackageWithdrewHTMLProps],
  string
>

describe('On Package Withdrew', () => {
  beforeEach(() => {
    inMemoryPhotosRepository = new InMemoryPhotosRepository()
    inMemoryPackagesRepository = new InMemoryPackagesRepository(
      inMemoryPhotosRepository,
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

    fakeMakePackageWithdrewEmailHTML = new FakeMakePackageWithdrewEmailHTML()

    registerNotificationExecuteSpy = vi.spyOn(
      registerNotificationUseCase,
      'execute',
    )

    sendEmailNotificationExecuteSpy = vi.spyOn(
      sendEmailNotificationUseCase,
      'execute',
    )

    fakeMakePackageWithdrewEmailHTMLExecuteSpy = vi.spyOn(
      fakeMakePackageWithdrewEmailHTML,
      'execute',
    )

    new OnPackageWithdrew(
      inMemoryRecipientsRepository,
      inMemoryDeliveryPeopleRepository,
      registerNotificationUseCase,
      sendEmailNotificationUseCase,
      fakeMakePackageWithdrewEmailHTML,
    )
  })

  it('should send notifications when a package is withdrew', async () => {
    const recipient = makeRecipient()
    const deliveryPerson = makeDeliveryPerson()
    const pkg = makePackage({
      recipientId: recipient.id,
      status: 'waiting',
    })

    await inMemoryRecipientsRepository.create(recipient)
    await inMemoryDeliveryPeopleRepository.create(deliveryPerson)
    await inMemoryPackagesRepository.create(pkg)

    pkg.status = 'withdrew'
    pkg.deliveryPersonId = deliveryPerson.id
    pkg.withdrewAt = new Date()

    await inMemoryPackagesRepository.save(pkg)

    await waitFor(() => {
      expect(registerNotificationExecuteSpy).toHaveBeenCalled()
      expect(sendEmailNotificationExecuteSpy).toHaveBeenCalled()
      expect(fakeMakePackageWithdrewEmailHTMLExecuteSpy).toHaveBeenCalled()
    })
  })
})
