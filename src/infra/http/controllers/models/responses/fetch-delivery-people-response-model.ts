import { ApiProperty } from '@nestjs/swagger'
import { DeliveryPersonResponseModel } from './delivery-person-response-model'

export class FetchDeliveryPeopleResponseModel {
  @ApiProperty({
    type: [DeliveryPersonResponseModel],
  })
  deliveryPeople!: DeliveryPersonResponseModel[]
}
