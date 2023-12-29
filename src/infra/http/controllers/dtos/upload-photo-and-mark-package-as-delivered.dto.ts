import { ApiProperty } from '@nestjs/swagger'

export class UploadPhotoAndMarkPackageAsDeliveredDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  file!: any
}
