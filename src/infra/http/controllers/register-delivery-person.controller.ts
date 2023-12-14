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
import { RegisterDeliveryPersonUseCase } from '@/domain/fast-feet/application/use-cases/register-delivery-person'
import { RegisterDeliveryPersonDto } from './dtos/register-delivery-person.dto'
import { DeliveryPersonAlreadyExistsError } from '@/domain/fast-feet/application/use-cases/errors/delivery-person-already-exists-error'

const registerDeliveryPersonBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  cpf: z.string().length(11),
  password: z.string().min(8),
  address: z.string(),
  district: z.string(),
  city: z.string(),
  state: z.enum(StateArr),
})

type RegisterDeliveryPersonBodySchema = z.infer<
  typeof registerDeliveryPersonBodySchema
>

@Controller('/delivery-people')
@Roles(Role.Admin)
export class RegisterDeliveryPersonController {
  constructor(
    private readonly registerDeliveryPerson: RegisterDeliveryPersonUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(registerDeliveryPersonBodySchema))
  @ApiBody({ type: [RegisterDeliveryPersonDto] })
  async handle(@Body() body: RegisterDeliveryPersonBodySchema) {
    const { name, email, cpf, password, address, district, city, state } = body

    const result = await this.registerDeliveryPerson.execute({
      name,
      email,
      cpf,
      password,
      address,
      district,
      city,
      state,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case DeliveryPersonAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
