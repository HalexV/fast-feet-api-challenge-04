import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
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
import { EditDeliveryPersonUseCase } from '@/domain/fast-feet/application/use-cases/edit-delivery-person'
import { EditDeliveryPersonDto } from './dtos/edit-delivery-person.dto'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'

const editDeliveryPersonBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  cpf: z.string().length(11),
  password: z.string().min(8),
  address: z.string(),
  district: z.string(),
  city: z.string(),
  state: z.enum(StateArr),
  isActive: z.boolean(),
})

type EditDeliveryPersonBodySchema = z.infer<typeof editDeliveryPersonBodySchema>

const bodyValidationPipe = new ZodValidationPipe(editDeliveryPersonBodySchema)

@Controller('/delivery-people/:id')
@Roles(Role.Admin)
export class EditDeliveryPersonController {
  constructor(private readonly editDeliveryPerson: EditDeliveryPersonUseCase) {}

  @Put()
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: EditDeliveryPersonDto })
  async handle(
    @Param('id') id: string,
    @Body(bodyValidationPipe) body: EditDeliveryPersonBodySchema,
  ) {
    const {
      name,
      email,
      cpf,
      password,
      address,
      district,
      city,
      state,
      isActive,
    } = body

    const result = await this.editDeliveryPerson.execute({
      id,
      name,
      email,
      cpf,
      password,
      address,
      district,
      city,
      state,
      isActive,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
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
