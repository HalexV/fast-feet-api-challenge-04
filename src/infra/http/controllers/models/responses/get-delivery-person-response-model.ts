import { ApiProperty } from '@nestjs/swagger'
import { DeliveryPersonResponseModel } from './delivery-person-response-model'

export class GetDeliveryPersonResponseModel {
  @ApiProperty({
    type: DeliveryPersonResponseModel,
  })
  deliveryPerson!: DeliveryPersonResponseModel
}
