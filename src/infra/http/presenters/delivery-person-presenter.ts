import { DeliveryPerson } from '@/domain/fast-feet/enterprise/entities/DeliveryPerson'
import { DeliveryPersonResponseModel } from '../controllers/models/responses/delivery-person-response-model'

export class DeliveryPersonPresenter {
  static toHTTP(deliveryPerson: DeliveryPerson): DeliveryPersonResponseModel {
    return {
      id: deliveryPerson.id.toString(),
      name: deliveryPerson.name,
      cpf: deliveryPerson.cpf,
      email: deliveryPerson.email,
      address: deliveryPerson.address,
      district: deliveryPerson.district,
      city: deliveryPerson.city,
      state: deliveryPerson.state,
      createdAt: deliveryPerson.createdAt,
      updatedAt: deliveryPerson.updatedAt,
      isActive: deliveryPerson.isActive,
    }
  }
}
