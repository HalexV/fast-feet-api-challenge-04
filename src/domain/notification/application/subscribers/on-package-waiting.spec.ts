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
import { makeRecipient } from 'test/factories/make-recipient'
import { makePackage } from 'test/factories/make-package'
import { waitFor } from 'test/utils/wait-for'
import { FakeMakePackageWaitingEmailHTML } from 'test/email/fake-make-package-waiting-email-html'
import { PackageWaitingHTMLProps } from '../email/makePackageWaitingEmailHTML'

let inMemoryPhotosRepository: InMemoryPhotosRepository
let inMemoryPackagesRepository: InMemoryPackagesRepository
let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let inMemoryRecipientsRepository: InMemoryRecipientsRepository

let registerNotificationUseCase: RegisterNotificationUseCase

let fakeEmailer: FakeEmailer
let sendEmailNotificationUseCase: SendEmailNotificationUseCase

let fakeMakePackageWaitingEmailHTML: FakeMakePackageWaitingEmailHTML

let registerNotificationExecuteSpy: SpyInstance<
  [RegisterNotificationUseCaseRequest],
  Promise<RegisterNotificationUseCaseResponse>
>

let sendEmailNotificationExecuteSpy: SpyInstance<
  [SendEmailNotificationUseCaseRequest],
  Promise<void>
>

let fakeMakePackageWaitingEmailHTMLExecuteSpy: SpyInstance<
  [PackageWaitingHTMLProps],
  string
>

describe('On Package Waiting', () => {
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

    fakeMakePackageWaitingEmailHTML = new FakeMakePackageWaitingEmailHTML()

    registerNotificationExecuteSpy = vi.spyOn(
      registerNotificationUseCase,
      'execute',
    )

    sendEmailNotificationExecuteSpy = vi.spyOn(
      sendEmailNotificationUseCase,
      'execute',
    )

    fakeMakePackageWaitingEmailHTMLExecuteSpy = vi.spyOn(
      fakeMakePackageWaitingEmailHTML,
      'execute',
    )

    new OnPackagePosted(
      inMemoryRecipientsRepository,
      registerNotificationUseCase,
      sendEmailNotificationUseCase,
      fakeMakePackageWaitingEmailHTML,
    )
  })

  it('should send notifications when a package status is set to waiting', async () => {
    const recipient = makeRecipient()
    const pkg = makePackage({
      recipientId: recipient.id,
    })

    await inMemoryRecipientsRepository.create(recipient)
    await inMemoryPackagesRepository.create(pkg)

    pkg.status = 'waiting'

    await inMemoryPackagesRepository.save(pkg)

    await waitFor(() => {
      expect(registerNotificationExecuteSpy).toHaveBeenCalled()
      expect(sendEmailNotificationExecuteSpy).toHaveBeenCalled()
      expect(fakeMakePackageWaitingEmailHTMLExecuteSpy).toHaveBeenCalled()
    })
  })
})
