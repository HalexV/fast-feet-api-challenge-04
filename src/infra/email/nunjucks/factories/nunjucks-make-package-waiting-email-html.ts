import {
  MakePackageWaitingEmailHTML,
  PackageWaitingHTMLProps,
} from '@/domain/notification/application/email/makePackageWaitingEmailHTML'
import { njks } from '../nunjucks'
import { Injectable } from '@nestjs/common'

@Injectable()
export class NunjucksMakePackageWaitingEmailHTML
  implements MakePackageWaitingEmailHTML
{
  execute({
    completeAddress,
    packageDescription,
    recipientFirstName,
    status,
  }: PackageWaitingHTMLProps): string {
    return njks.render('on-package-waiting.html', {
      completeAddress,
      packageDescription,
      recipientFirstName,
      status,
    })
  }
}
