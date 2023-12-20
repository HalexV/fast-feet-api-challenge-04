import { ApiProperty } from '@nestjs/swagger'
import { PackageWithRecipientResponseModel } from './package-with-recipient-response-model'

export class FetchPackagesResponseModel {
  @ApiProperty({
    type: [PackageWithRecipientResponseModel],
  })
  packages!: PackageWithRecipientResponseModel[]
}
