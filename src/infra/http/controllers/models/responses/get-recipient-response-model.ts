import { ApiProperty } from '@nestjs/swagger'
import { RecipientResponseModel } from './recipient-response-model'

export class GetRecipientResponseModel {
  @ApiProperty({
    type: RecipientResponseModel,
  })
  recipient!: RecipientResponseModel
}
