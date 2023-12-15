import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { ApiBody, ApiParam } from '@nestjs/swagger'
import { StateArr } from '@/core/types/state'
import { Roles } from '@/infra/auth/roles.decorator'
import { Role } from '@/core/types/role.enum'
import { DeliveryPersonAlreadyExistsError } from '@/domain/fast-feet/application/use-cases/errors/delivery-person-already-exists-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { EditAdminUseCase } from '@/domain/fast-feet/application/use-cases/edit-admin'
import { EditAdminDto } from './dtos/edit-admin.dto'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'

const editAdminBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  cpf: z.string().length(11),
  password: z.string().min(8),
  address: z.string(),
  district: z.string(),
  city: z.string(),
  state: z.enum(StateArr),
})

type EditAdminBodySchema = z.infer<typeof editAdminBodySchema>

const bodyValidationPipe = new ZodValidationPipe(editAdminBodySchema)

@Controller('/admins/:id')
@Roles(Role.Admin)
export class EditAdminController {
  constructor(private readonly editAdmin: EditAdminUseCase) {}

  @Put()
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: EditAdminDto })
  async handle(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe) body: EditAdminBodySchema,
  ) {
    const { name, email, cpf, password, address, district, city, state } = body

    const userId = user.sub

    const result = await this.editAdmin.execute({
      userId,
      adminId: id,
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
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case DeliveryPersonAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
