import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { WrongCredentialsError } from '@/domain/fast-feet/application/use-cases/errors/wrong-credentials-error'
import { Public } from '@/infra/auth/public.decorator'
import { AuthenticateAdminUseCase } from '@/domain/fast-feet/application/use-cases/authenticate-admin'
import { ApiBody, ApiOkResponse } from '@nestjs/swagger'
import { AuthenticateAdminDto } from './dtos/authenticate-admin.dto'
import { AuthenticateResponseModel } from './models/responses/authenticate-response-model'

const authenticateAdminBodySchema = z.object({
  cpf: z.string(),
  password: z.string(),
})

type AuthenticateAdminBodySchema = z.infer<typeof authenticateAdminBodySchema>

@Controller('/admins/sessions')
@Public()
export class AuthenticateAdminController {
  constructor(private readonly authenticateAdmin: AuthenticateAdminUseCase) {}

  @Post()
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(authenticateAdminBodySchema))
  @ApiBody({ type: AuthenticateAdminDto })
  @ApiOkResponse({ type: AuthenticateResponseModel })
  async handle(@Body() body: AuthenticateAdminBodySchema) {
    const { cpf, password } = body

    const result = await this.authenticateAdmin.execute({
      cpf,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { accessToken } = result.value

    return {
      access_token: accessToken,
    }
  }
}
