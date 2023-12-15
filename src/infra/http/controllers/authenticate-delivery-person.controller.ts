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
import { ApiBody, ApiOkResponse } from '@nestjs/swagger'
import { AuthenticateDeliveryPersonDto } from './dtos/authenticate-delivery-person.dto'
import { AuthenticateDeliveryPersonUseCase } from '@/domain/fast-feet/application/use-cases/authenticate-delivery-person'
import { AuthenticateResponseModel } from './models/responses/authenticate-response-model'

const authenticateDeliveryPersonBodySchema = z.object({
  cpf: z.string(),
  password: z.string(),
})

type AuthenticateDeliveryPersonBodySchema = z.infer<
  typeof authenticateDeliveryPersonBodySchema
>

@Controller('/sessions')
@Public()
export class AuthenticateDeliveryPersonController {
  constructor(
    private readonly authenticateDeliveryPerson: AuthenticateDeliveryPersonUseCase,
  ) {}

  @Post()
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(authenticateDeliveryPersonBodySchema))
  @ApiBody({ type: AuthenticateDeliveryPersonDto })
  @ApiOkResponse({ type: AuthenticateResponseModel })
  async handle(@Body() body: AuthenticateDeliveryPersonBodySchema) {
    const { cpf, password } = body

    const result = await this.authenticateDeliveryPerson.execute({
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
