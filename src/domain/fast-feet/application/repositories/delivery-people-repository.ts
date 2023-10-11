import { PaginationParams } from '@/core/repositories/pagination-params'
import { DeliveryPerson } from '../../enterprise/entities/DeliveryPerson'

export abstract class DeliveryPeopleRepository {
  abstract findByCPF(cpf: string): Promise<DeliveryPerson | null>
  abstract create(deliveryPerson: DeliveryPerson): Promise<void>
  abstract findMany(params: PaginationParams): Promise<DeliveryPerson[]>
}
