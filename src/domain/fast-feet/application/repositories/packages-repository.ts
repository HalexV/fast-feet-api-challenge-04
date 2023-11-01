import { PaginationParams } from '@/core/repositories/pagination-params'
import { Package } from '../../enterprise/entities/Package'

export abstract class PackagesRepository {
  abstract findById(id: string): Promise<Package | null>
  abstract findMany(params: PaginationParams): Promise<Package[]>
  abstract findSomeNotDelivered(): Promise<Package | null>
  abstract create(pkg: Package): Promise<void>
  abstract save(pkg: Package): Promise<void>
  abstract deleteManyByRecipientId(recipientId: string): Promise<void>
}
