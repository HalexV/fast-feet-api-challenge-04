import {
  MakePackagePostedEmailHTML,
  PackagePostedHTMLProps,
} from '@/domain/notification/application/email/makePackagePostedEmailHTML'
import { njks } from '../nunjucks'
import { Injectable } from '@nestjs/common'

@Injectable()
export class NunjucksMakePackagePostedEmailHTML
  implements MakePackagePostedEmailHTML
{
  execute({
    completeAddress,
    packageDescription,
    postedAt,
    recipientFirstName,
    status,
  }: PackagePostedHTMLProps): string {
    return njks.render('on-package-posted.html', {
      completeAddress,
      packageDescription,
      postedAt: postedAt.toLocaleDateString(),
      recipientFirstName,
      status,
    })
  }
}
