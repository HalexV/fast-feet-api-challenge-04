import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { SpyInstance } from 'vitest'
import { OnPackagePosted } from './on-package-posted'
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
import { FakeMakePackagePostedEmailHTML } from 'test/email/fake-make-package-posted-email-html'
import { makeRecipient } from 'test/factories/make-recipient'
import { makePackage } from 'test/factories/make-package'
import { PackagePostedHTMLProps } from '../email/makePackagePostedEmailHTML'
import { waitFor } from 'test/utils/wait-for'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository

let registerNotificationUseCase: RegisterNotificationUseCase

let fakeEmailer: FakeEmailer
let sendEmailNotificationUseCase: SendEmailNotificationUseCase

let fakeMakePackagePostedEmailHTML: FakeMakePackagePostedEmailHTML

let registerNotificationExecuteSpy: SpyInstance<
  [RegisterNotificationUseCaseRequest],
  Promise<RegisterNotificationUseCaseResponse>
>

let sendEmailNotificationExecuteSpy: SpyInstance<
  [SendEmailNotificationUseCaseRequest],
  Promise<void>
>

let fakeMakePackagePostedEmailHTMLExecuteSpy: SpyInstance<
  [PackagePostedHTMLProps],
  string
>

describe('On Package Posted', () => {
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

    registerNotificationUseCase = new RegisterNotificationUseCase(
      inMemoryNotificationsRepository,
    )

    fakeEmailer = new FakeEmailer()

    sendEmailNotificationUseCase = new SendEmailNotificationUseCase(fakeEmailer)

    fakeMakePackagePostedEmailHTML = new FakeMakePackagePostedEmailHTML()

    registerNotificationExecuteSpy = vi.spyOn(
      registerNotificationUseCase,
      'execute',
    )

    sendEmailNotificationExecuteSpy = vi.spyOn(
      sendEmailNotificationUseCase,
      'execute',
    )

    fakeMakePackagePostedEmailHTMLExecuteSpy = vi.spyOn(
      fakeMakePackagePostedEmailHTML,
      'execute',
    )

    new OnPackagePosted(
      inMemoryRecipientsRepository,
      registerNotificationUseCase,
      sendEmailNotificationUseCase,
      fakeMakePackagePostedEmailHTML,
    )
  })

  it('should send notifications when a package is posted', async () => {
    const recipient = makeRecipient()
    const pkg = makePackage({
      recipientId: recipient.id,
    })

    await inMemoryRecipientsRepository.create(recipient)
    await inMemoryPackagesRepository.create(pkg)

    await waitFor(() => {
      expect(registerNotificationExecuteSpy).toHaveBeenCalled()
      expect(sendEmailNotificationExecuteSpy).toHaveBeenCalled()
      expect(fakeMakePackagePostedEmailHTMLExecuteSpy).toHaveBeenCalled()
    })
  })
})
