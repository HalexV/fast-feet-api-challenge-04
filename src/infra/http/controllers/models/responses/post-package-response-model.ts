import { ApiProperty } from '@nestjs/swagger'
import { PackageResponseModel } from './package-response-model'

export class PostPackageResponseModel {
  @ApiProperty({
    type: PackageResponseModel,
  })
  package!: PackageResponseModel
}
