import { Package } from '../../enterprise/entities/Package'

export abstract class PackagesRepository {
  abstract findSomeNotDelivered(): Promise<Package | null>
  abstract create(pkg: Package): Promise<void>
  abstract save(pkg: Package): Promise<void>
  abstract deleteManyByRecipientId(recipientId: string): Promise<void>
}
