import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { ApiBody } from '@nestjs/swagger'
import { StateArr } from '@/core/types/state'
import { Roles } from '@/infra/auth/roles.decorator'
import { Role } from '@/core/types/role.enum'
import { RegisterRecipientUseCase } from '@/domain/fast-feet/application/use-cases/register-recipient'
import { RegisterRecipientDto } from './dtos/register-recipient.dto'
import { RecipientAlreadyExistsError } from '@/domain/fast-feet/application/use-cases/errors/recipient-already-exists-error'

const registerRecipientBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  address: z.string(),
  district: z.string(),
  city: z.string(),
  state: z.enum(StateArr),
  zipcode: z.string().length(8),
})

type RegisterRecipientBodySchema = z.infer<typeof registerRecipientBodySchema>

@Controller('/recipients')
@Roles(Role.Admin)
export class RegisterRecipientController {
  constructor(private readonly registerRecipient: RegisterRecipientUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(registerRecipientBodySchema))
  @ApiBody({ type: RegisterRecipientDto })
  async handle(@Body() body: RegisterRecipientBodySchema) {
    const { name, email, address, district, city, state, zipcode } = body

    const result = await this.registerRecipient.execute({
      name,
      email,
      address,
      district,
      city,
      state,
      zipcode,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case RecipientAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
