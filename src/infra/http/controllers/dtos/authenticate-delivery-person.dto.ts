import { ApiProperty } from '@nestjs/swagger'

export class AuthenticateDeliveryPersonDto {
  @ApiProperty()
  cpf!: string

  @ApiProperty()
  password!: string
}
