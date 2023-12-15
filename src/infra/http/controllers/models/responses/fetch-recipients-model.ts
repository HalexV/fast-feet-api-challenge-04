import { ApiProperty } from '@nestjs/swagger'
import { RecipientResponseModel } from './recipient-response-model'

export class FetchRecipientsResponseModel {
  @ApiProperty({
    type: [RecipientResponseModel],
  })
  recipients!: RecipientResponseModel[]
}
