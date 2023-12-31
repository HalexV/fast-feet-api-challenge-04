import { PaginationParams } from '@/core/repositories/pagination-params'
import { Package } from '../../enterprise/entities/Package'
import { State } from '@/core/types/state'
import { PackageWithRecipient } from '../../enterprise/entities/value-objects/package-with-recipient'

export interface FindManyByAddressAndDeliveryPersonIdWithRecipientParams
  extends PaginationParams {
  deliveryPersonId: string
  city: string
  state: State
  district?: string
}

export interface FindManyDeliveredByDeliveryPersonIdWithRecipientParams
  extends PaginationParams {
  deliveryPersonId: string
}
export abstract class PackagesRepository {
  abstract findById(id: string): Promise<Package | null>
  abstract findByIdWithRecipient(
    id: string,
  ): Promise<PackageWithRecipient | null>
  abstract findMany(params: PaginationParams): Promise<Package[]>
  abstract findManyWithRecipient(
    params: PaginationParams,
  ): Promise<PackageWithRecipient[]>
  abstract findManyDeliveredByDeliveryPersonIdWithRecipient(
    params: FindManyDeliveredByDeliveryPersonIdWithRecipientParams,
  ): Promise<PackageWithRecipient[]>
  abstract findManyPendingByAddressAndDeliveryPersonIdWithRecipient(
    params: FindManyByAddressAndDeliveryPersonIdWithRecipientParams,
  ): Promise<PackageWithRecipient[]>
  abstract findSomeNotDeliveredByRecipientId(
    recipientId: string,
  ): Promise<Package | null>
  abstract create(pkg: Package): Promise<void>
  abstract save(pkg: Package): Promise<void>
  abstract deleteManyByRecipientId(recipientId: string): Promise<void>
  abstract delete(pkg: Package): Promise<void>
}
