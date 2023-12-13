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
import { RegisterAdminDto } from './dtos/register-admin.dto'
import { Roles } from '@/infra/auth/roles.decorator'
import { Role } from '@/core/types/role.enum'
import { RegisterAdminUseCase } from '@/domain/fast-feet/application/use-cases/register-admin'
import { AdminAlreadyExistsError } from '@/domain/fast-feet/application/use-cases/errors/admin-already-exists-error'

const registerAdminBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  cpf: z.string().length(11),
  password: z.string().min(8),
  address: z.string(),
  district: z.string(),
  city: z.string(),
  state: z.enum(StateArr),
})

type RegisterAdminBodySchema = z.infer<typeof registerAdminBodySchema>

@Controller('/admins')
@Roles(Role.Admin)
export class RegisterAdminController {
  constructor(private readonly registerAdmin: RegisterAdminUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(registerAdminBodySchema))
  @ApiBody({ type: [RegisterAdminDto] })
  async handle(@Body() body: RegisterAdminBodySchema) {
    const { name, email, cpf, password, address, district, city, state } = body

    const result = await this.registerAdmin.execute({
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
        case AdminAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
