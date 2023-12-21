import { Status, StatusArr } from '@/core/types/status'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class EditPackageDto {
  @ApiProperty()
  description!: string

  @ApiProperty({
    enum: StatusArr,
  })
  status!: Status

  @ApiProperty()
  postedAt!: Date

  @ApiProperty({
    format: 'uuid',
  })
  recipientId!: string

  @ApiPropertyOptional()
  withdrewAt!: Date

  @ApiPropertyOptional()
  deliveredAt!: Date

  @ApiPropertyOptional({
    format: 'uuid',
  })
  deliveryPersonId!: string
}
