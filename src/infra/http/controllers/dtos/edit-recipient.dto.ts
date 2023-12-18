import { State, StateArr } from '@/core/types/state'
import { ApiProperty } from '@nestjs/swagger'

export class EditRecipientDto {
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

  @ApiProperty({
    minLength: 8,
    maxLength: 8,
  })
  zipcode!: string
}
