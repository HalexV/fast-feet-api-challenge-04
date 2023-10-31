export abstract class Emailer {
  abstract send(to: string, subject: string, html: string): Promise<void>
}
