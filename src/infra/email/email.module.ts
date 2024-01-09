import { Emailer } from '@/domain/notification/application/email/emailer'
import { Module } from '@nestjs/common'
import { NodemailerService } from './nodemailer/nodemailer.service'
import { MakePackagePostedEmailHTML } from '@/domain/notification/application/email/makePackagePostedEmailHTML'
import { NunjucksMakePackagePostedEmailHTML } from './nunjucks/factories/nunjucks-make-package-posted-email-html'
import { MakePackageDeliveredEmailHTML } from '@/domain/notification/application/email/makePackageDeliveredEmailHTML'
import { NunjucksMakePackageDeliveredEmailHTML } from './nunjucks/factories/nunjucks-make-package-delivered-email-html'
import { MakePackageWaitingEmailHTML } from '@/domain/notification/application/email/makePackageWaitingEmailHTML'
import { NunjucksMakePackageWaitingEmailHTML } from './nunjucks/factories/nunjucks-make-package-waiting-email-html'
import { MakePackageWithdrewEmailHTML } from '@/domain/notification/application/email/makePackageWithdrewEmailHTML'
import { NunjucksMakePackageWithdrewEmailHTML } from './nunjucks/factories/nunjucks-make-package-withdrew-email-html'
import { MakePackageReturnedEmailHTML } from '@/domain/notification/application/email/makePackageReturnedEmailHTML'
import { NunjucksMakePackageReturnedEmailHTML } from './nunjucks/factories/nunjucks-make-package-returned-email-html'

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
      provide: MakePackageWaitingEmailHTML,
      useClass: NunjucksMakePackageWaitingEmailHTML,
    },
    {
      provide: MakePackageWithdrewEmailHTML,
      useClass: NunjucksMakePackageWithdrewEmailHTML,
    },
    {
      provide: MakePackageDeliveredEmailHTML,
      useClass: NunjucksMakePackageDeliveredEmailHTML,
    },
    {
      provide: MakePackageReturnedEmailHTML,
      useClass: NunjucksMakePackageReturnedEmailHTML,
    },
  ],
  exports: [
    Emailer,
    MakePackagePostedEmailHTML,
    MakePackageWaitingEmailHTML,
    MakePackageWithdrewEmailHTML,
    MakePackageDeliveredEmailHTML,
    MakePackageReturnedEmailHTML,
  ],
})
export class EmailModule {}
