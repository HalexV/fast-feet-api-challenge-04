import { ApiProperty } from '@nestjs/swagger'

export class PostPackageDto {
  @ApiProperty()
  description!: string

  @ApiProperty({
    format: 'uuid',
  })
  recipientId!: string
}
