import {
  MakePackageWithdrewEmailHTML,
  PackageWithdrewHTMLProps,
} from '@/domain/notification/application/email/makePackageWithdrewEmailHTML'
import { njks } from '../nunjucks'
import { Injectable } from '@nestjs/common'

@Injectable()
export class NunjucksMakePackageWithdrewEmailHTML
  implements MakePackageWithdrewEmailHTML
{
  execute({
    completeAddress,
    packageDescription,
    deliveryPersonName,
    recipientFirstName,
    status,
  }: PackageWithdrewHTMLProps): string {
    return njks.render('on-package-withdrew.html', {
      completeAddress,
      packageDescription,
      deliveryPersonName,
      recipientFirstName,
      status,
    })
  }
}
