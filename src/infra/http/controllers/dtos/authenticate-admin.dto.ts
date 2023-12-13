import { ApiProperty } from '@nestjs/swagger'

export class AuthenticateAdminDto {
  @ApiProperty()
  cpf!: string

  @ApiProperty()
  password!: string
}
