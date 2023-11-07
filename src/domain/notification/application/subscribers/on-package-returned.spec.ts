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
import { FakeMakePackageReturnedEmailHTML } from 'test/email/fake-make-package-returned-email-html'
import { PackageReturnedHTMLProps } from '../email/makePackageReturnedEmailHTML'
import { OnPackageReturned } from './on-package-returned'
import { makeDeliveryPerson } from 'test/factories/make-delivery-person'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let inMemoryDeliveryPeopleRepository: InMemoryDeliveryPeopleRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository

let registerNotificationUseCase: RegisterNotificationUseCase

let fakeEmailer: FakeEmailer
let sendEmailNotificationUseCase: SendEmailNotificationUseCase

let fakeMakePackageReturnedEmailHTML: FakeMakePackageReturnedEmailHTML

let registerNotificationExecuteSpy: SpyInstance<
  [RegisterNotificationUseCaseRequest],
  Promise<RegisterNotificationUseCaseResponse>
>

let sendEmailNotificationExecuteSpy: SpyInstance<
  [SendEmailNotificationUseCaseRequest],
  Promise<void>
>

let fakeMakePackageReturnedEmailHTMLExecuteSpy: SpyInstance<
  [PackageReturnedHTMLProps],
  string
>

describe('On Package Returned', () => {
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

    fakeMakePackageReturnedEmailHTML = new FakeMakePackageReturnedEmailHTML()

    registerNotificationExecuteSpy = vi.spyOn(
      registerNotificationUseCase,
      'execute',
    )

    sendEmailNotificationExecuteSpy = vi.spyOn(
      sendEmailNotificationUseCase,
      'execute',
    )

    fakeMakePackageReturnedEmailHTMLExecuteSpy = vi.spyOn(
      fakeMakePackageReturnedEmailHTML,
      'execute',
    )

    new OnPackageReturned(
      inMemoryRecipientsRepository,
      inMemoryDeliveryPeopleRepository,
      registerNotificationUseCase,
      sendEmailNotificationUseCase,
      fakeMakePackageReturnedEmailHTML,
    )
  })

  it('should send notifications when a package is returned', async () => {
    const recipient = makeRecipient()
    const deliveryPerson = makeDeliveryPerson()
    const pkg = makePackage({
      recipientId: recipient.id,
      status: 'withdrew',
      deliveryPersonId: deliveryPerson.id,
      withdrewAt: new Date(),
    })

    await inMemoryRecipientsRepository.create(recipient)
    await inMemoryDeliveryPeopleRepository.create(deliveryPerson)
    await inMemoryPackagesRepository.create(pkg)

    pkg.status = 'returned'

    await inMemoryPackagesRepository.save(pkg)

    await waitFor(() => {
      expect(registerNotificationExecuteSpy).toHaveBeenCalled()
      expect(sendEmailNotificationExecuteSpy).toHaveBeenCalled()
      expect(fakeMakePackageReturnedEmailHTMLExecuteSpy).toHaveBeenCalled()
    })
  })
})
