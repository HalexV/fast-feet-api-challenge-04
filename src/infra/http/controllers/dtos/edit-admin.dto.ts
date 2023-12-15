import { State, StateArr } from '@/core/types/state'
import { ApiProperty } from '@nestjs/swagger'

export class EditAdminDto {
  @ApiProperty()
  name!: string

  @ApiProperty({
    format: 'email',
  })
  email!: string

  @ApiProperty({
    minLength: 11,
    maxLength: 11,
  })
  cpf!: string

  @ApiProperty({
    minLength: 8,
  })
  password!: string

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
}
