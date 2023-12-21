import { ApiProperty } from '@nestjs/swagger'
import { PackageWithRecipientResponseModel } from './package-with-recipient-response-model'

export class FetchDeliveredPackagesByDeliveryPersonIdResponseModel {
  @ApiProperty({
    type: [PackageWithRecipientResponseModel],
  })
  packages!: PackageWithRecipientResponseModel[]
}
