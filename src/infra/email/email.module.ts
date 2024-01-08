import { Emailer } from '@/domain/notification/application/email/emailer'
import { Module } from '@nestjs/common'
import { NodemailerService } from './nodemailer/nodemailer.service'
import { MakePackagePostedEmailHTML } from '@/domain/notification/application/email/makePackagePostedEmailHTML'
import { NunjucksMakePackagePostedEmailHTML } from './nunjucks/factories/nunjucks-make-package-posted-email-html'
import { MakePackageDeliveredEmailHTML } from '@/domain/notification/application/email/makePackageDeliveredEmailHTML'
import { NunjucksMakePackageDeliveredEmailHTML } from './nunjucks/factories/nunjucks-make-package-delivered-email-html'

@Module({
  providers: [
    {
      provide: Emailer,
      useClass: NodemailerService,
    },
    {
      provide: MakePackagePostedEmailHTML,
      useClass: NunjucksMakePackagePostedEmailHTML,
    },
    {
      provide: MakePackageDeliveredEmailHTML,
      useClass: NunjucksMakePackageDeliveredEmailHTML,
    },
  ],
  exports: [Emailer, MakePackagePostedEmailHTML, MakePackageDeliveredEmailHTML],
})
export class EmailModule {}
