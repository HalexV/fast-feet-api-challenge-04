import { PaginationParams } from '@/core/repositories/pagination-params'
import { Package } from '../../enterprise/entities/Package'
import { State } from '@/core/types/state'

export interface FindManyByAddressAndDeliveryPersonIdParams
  extends PaginationParams {
  deliveryPersonId: string
  city: string
  state: State
  district?: string
}

export interface FindManyDeliveredByDeliveryPersonIdParams
  extends PaginationParams {
  deliveryPersonId: string
}
export abstract class PackagesRepository {
  abstract findById(id: string): Promise<Package | null>
  abstract findMany(params: PaginationParams): Promise<Package[]>
  abstract findManyDeliveredByDeliveryPersonId(
    params: FindManyDeliveredByDeliveryPersonIdParams,
  ): Promise<Package[]>
  abstract findManyPendingByAddressAndDeliveryPersonId(
    params: FindManyByAddressAndDeliveryPersonIdParams,
  ): Promise<Package[]>
  abstract findSomeNotDeliveredByRecipientId(
    recipientId: string,
  ): Promise<Package | null>
  abstract create(pkg: Package): Promise<void>
  abstract save(pkg: Package): Promise<void>
  abstract deleteManyByRecipientId(recipientId: string): Promise<void>
  abstract delete(pkg: Package): Promise<void>
}
