import {
  MakePackageReturnedEmailHTML,
  PackageReturnedHTMLProps,
} from '@/domain/notification/application/email/makePackageReturnedEmailHTML'
import { njks } from '../nunjucks'
import { Injectable } from '@nestjs/common'

@Injectable()
export class NunjucksMakePackageReturnedEmailHTML
  implements MakePackageReturnedEmailHTML
{
  execute({
    completeAddress,
    packageDescription,
    deliveryPersonName,
    recipientFirstName,
    status,
  }: PackageReturnedHTMLProps): string {
    return njks.render('on-package-returned.html', {
      completeAddress,
      packageDescription,
      deliveryPersonName,
      recipientFirstName,
      status,
    })
  }
}
