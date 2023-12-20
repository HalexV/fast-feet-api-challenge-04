import { State, StateArr } from '@/core/types/state'
import { Status, StatusArr } from '@/core/types/status'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class PackageWithRecipientResponseModel {
  @ApiProperty({
    format: 'uuid',
  })
  packageId!: string

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

  @ApiPropertyOptional({
    format: 'uuid',
    type: String,
  })
  deliveryPersonId?: string | null

  @ApiPropertyOptional({
    type: Date,
  })
  withdrewAt?: Date | null

  @ApiPropertyOptional({
    type: Date,
  })
  deliveredAt?: Date | null

  @ApiPropertyOptional({
    type: Date,
  })
  updatedAt?: Date | null

  @ApiProperty()
  recipient!: string

  @ApiProperty()
  address!: string

  @ApiProperty()
  district!: string

  @ApiProperty()
  city!: string

  @ApiProperty({
    enum: StateArr,
  })
  state!: State

  @ApiProperty()
  zipcode!: string
}
