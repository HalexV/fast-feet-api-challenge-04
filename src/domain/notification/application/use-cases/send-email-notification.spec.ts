import { SendEmailNotificationUseCase } from './send-email-notification'
import { FakeEmailer } from 'test/email/fake-emailer'

let fakeEmailer: FakeEmailer
let sut: SendEmailNotificationUseCase

describe('Send email notification', () => {
  beforeEach(() => {
    fakeEmailer = new FakeEmailer()
    sut = new SendEmailNotificationUseCase(fakeEmailer)
  })

  it('should be able to send an email', async () => {
    const sendSpy = vi.spyOn(fakeEmailer, 'send')

    const title = 'New email notification'
    const content = 'Email notification content'
    const recipientEmail = 'johndoe@example.com'

    await sut.execute({
      title,
      content,
      recipientEmail,
    })

    expect(sendSpy).toHaveBeenCalledWith(recipientEmail, title, content)
  })
})
