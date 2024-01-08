import { Emailer } from '@/domain/notification/application/email/emailer'
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'

@Injectable()
export class NodemailerService implements Emailer {
  constructor(private readonly nodemailer: MailerService) {}

  async send(to: string, subject: string, html: string): Promise<void> {
    await this.nodemailer.sendMail({
      to,
      subject,
      html,
      from: 'noreply@fastfeet.com',
    })
  }
}
