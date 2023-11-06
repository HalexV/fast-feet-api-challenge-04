import {
  PackageWaitingHTMLProps,
  MakePackageWaitingEmailHTML,
} from '@/domain/notification/application/email/makePackageWaitingEmailHTML'

export class FakeMakePackageWaitingEmailHTML
  implements MakePackageWaitingEmailHTML
{
  execute({
    completeAddress,
    packageDescription,
    recipientFirstName,
    status,
  }: PackageWaitingHTMLProps): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      <p>${completeAddress}, ${packageDescription}, ${recipientFirstName}, ${status}</p>
    </body>
    </html>
    `
  }
}
