import { State, StateArr } from '@/core/types/state'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RecipientResponseModel {
  @ApiProperty({
    format: 'uuid',
  })
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty({
    format: 'email',
  })
  email!: string

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
  createdAt!: Date

  @ApiPropertyOptional({
    type: Date,
  })
  updatedAt?: Date | null

  @ApiProperty()
  zipcode!: string
}
