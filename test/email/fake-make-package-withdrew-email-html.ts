import {
  PackageWithdrewHTMLProps,
  MakePackageWithdrewEmailHTML,
} from '@/domain/notification/application/email/makePackageWithdrewEmailHTML'

export class FakeMakePackageWithdrewEmailHTML
  implements MakePackageWithdrewEmailHTML
{
  execute({
    completeAddress,
    deliveryPersonName,
    packageDescription,
    recipientFirstName,
    status,
  }: PackageWithdrewHTMLProps): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      <p>${completeAddress}, ${packageDescription}, ${recipientFirstName}, ${deliveryPersonName}, ${status}</p>
    </body>
    </html>
    `
  }
}
