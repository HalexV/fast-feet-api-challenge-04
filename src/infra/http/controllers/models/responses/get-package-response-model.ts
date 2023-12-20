import { ApiProperty } from '@nestjs/swagger'
import { PackageWithRecipientResponseModel } from './package-with-recipient-response-model'

export class GetPackageResponseModel {
  @ApiProperty({
    type: PackageWithRecipientResponseModel,
  })
  package!: PackageWithRecipientResponseModel
}
