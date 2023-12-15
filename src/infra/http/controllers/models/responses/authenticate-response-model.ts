import { ApiProperty } from '@nestjs/swagger'

export class AuthenticateResponseModel {
  @ApiProperty({
    format: 'jwt',
  })
  access_token!: string
}
