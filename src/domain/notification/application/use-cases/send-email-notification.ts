import { Emailer } from '../email/emailer'

export interface SendEmailNotificationUseCaseRequest {
  title: string
  content: string
  recipientEmail: string
}

export class SendEmailNotificationUseCase {
  constructor(private readonly emailer: Emailer) {}

  async execute({
    title,
    content,
    recipientEmail,
  }: SendEmailNotificationUseCaseRequest): Promise<void> {
    await this.emailer.send(recipientEmail, title, content)
  }
}
