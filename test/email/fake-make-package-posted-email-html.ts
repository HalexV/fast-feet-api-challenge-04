import {
  HTMLProps,
  MakePackagePostedEmailHTML,
} from '@/domain/notification/application/email/makePackagePostedEmailHTML'

export class FakeMakePackagePostedEmailHTML
  implements MakePackagePostedEmailHTML
{
  execute({
    completeAddress,
    packageDescription,
    postedAt,
    recipientFirstName,
    status,
  }: HTMLProps): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      <p>${completeAddress}, ${packageDescription}, ${postedAt.toLocaleDateString()}, ${recipientFirstName}, ${status}</p>
    </body>
    </html>
    `
  }
}
