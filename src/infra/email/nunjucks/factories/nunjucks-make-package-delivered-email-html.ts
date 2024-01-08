import { njks } from '../nunjucks'
import { Injectable } from '@nestjs/common'
import {
  MakePackageDeliveredEmailHTML,
  PackageDeliveredHTMLProps,
} from '@/domain/notification/application/email/makePackageDeliveredEmailHTML'

@Injectable()
export class NunjucksMakePackageDeliveredEmailHTML
  implements MakePackageDeliveredEmailHTML
{
  execute({
    completeAddress,
    packageDescription,
    deliveredAt,
    deliveryPersonName,
    recipientFirstName,
    status,
    photoUrl,
  }: PackageDeliveredHTMLProps): string {
    return njks.render('on-package-delivered.html', {
      completeAddress,
      packageDescription,
      deliveredAt: deliveredAt.toLocaleDateString(),
      deliveryPersonName,
      recipientFirstName,
      status,
      photoUrl,
    })
  }
}
