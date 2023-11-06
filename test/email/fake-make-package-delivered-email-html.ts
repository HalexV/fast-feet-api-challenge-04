import {
  PackageDeliveredHTMLProps,
  MakePackageDeliveredEmailHTML,
} from '@/domain/notification/application/email/makePackageDeliveredEmailHTML'

export class FakeMakePackageDeliveredEmailHTML
  implements MakePackageDeliveredEmailHTML
{
  execute({
    completeAddress,
    deliveryPersonName,
    deliveredAt,
    photoUrl,
    packageDescription,
    recipientFirstName,
    status,
  }: PackageDeliveredHTMLProps): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      <p>${completeAddress}, ${packageDescription}, ${recipientFirstName}, ${deliveryPersonName}, ${deliveredAt.toLocaleDateString()}, ${deliveredAt.toLocaleTimeString()}, ${status}</p>

      <figure>
        <img src="${photoUrl}" alt="Delivered photo">
      </figure>
    </body>
    </html>
    `
  }
}
