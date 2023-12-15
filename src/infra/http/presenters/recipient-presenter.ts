import { RecipientResponseModel } from '../controllers/models/responses/recipient-response-model'
import { Recipient } from '@/domain/fast-feet/enterprise/entities/Recipient'

export class RecipientPresenter {
  static toHTTP(recipient: Recipient): RecipientResponseModel {
    return {
      id: recipient.id.toString(),
      name: recipient.name,
      email: recipient.email,
      address: recipient.address,
      district: recipient.district,
      city: recipient.city,
      state: recipient.state,
      createdAt: recipient.createdAt,
      updatedAt: recipient.updatedAt,
      zipcode: recipient.zipcode,
    }
  }
}
