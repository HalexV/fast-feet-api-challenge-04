import { ApiProperty } from '@nestjs/swagger'
import { DeliveryPersonResponseModel } from './delivery-person-response-model'

export class FetchDeliveryPersonResponseModel {
  @ApiProperty({
    type: [DeliveryPersonResponseModel],
  })
  deliveryPerson!: DeliveryPersonResponseModel[]
}
