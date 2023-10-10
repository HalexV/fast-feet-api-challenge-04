import { DeliveryPeopleRepository } from '@/domain/fast-feet/application/repositories/delivery-people-repository'
import { DeliveryPerson } from '@/domain/fast-feet/enterprise/entities/DeliveryPerson'

export class InMemoryDeliveryPeopleRepository
  implements DeliveryPeopleRepository
{
  public items: DeliveryPerson[] = []

  async findByCPF(cpf: string): Promise<DeliveryPerson | null> {
    const deliveryPerson = this.items.find(
      (deliveryPerson) => deliveryPerson.cpf === cpf,
    )

    if (!deliveryPerson) {
      return null
    }

    return deliveryPerson
  }

  async create(deliveryPerson: DeliveryPerson): Promise<void> {
    this.items.push(deliveryPerson)
  }
}
