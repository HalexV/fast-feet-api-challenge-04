import { PaginationParams } from '@/core/repositories/pagination-params'
import { DeliveryPerson } from '../../enterprise/entities/DeliveryPerson'

export abstract class DeliveryPeopleRepository {
  abstract create(deliveryPerson: DeliveryPerson): Promise<void>
  abstract save(deliveryPerson: DeliveryPerson): Promise<void>
  abstract findByCPF(cpf: string): Promise<DeliveryPerson | null>
  abstract findById(id: string): Promise<DeliveryPerson | null>
  abstract findMany(params: PaginationParams): Promise<DeliveryPerson[]>
}
