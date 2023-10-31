import { Emailer } from '@/domain/notification/application/email/emailer'

export class FakeEmailer implements Emailer {
  async send(to: string, subject: string, html: string): Promise<void> {}
}
