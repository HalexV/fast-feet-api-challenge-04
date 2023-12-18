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
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { EditRecipientUseCase } from '@/domain/fast-feet/application/use-cases/edit-recipient'
import { EditRecipientDto } from './dtos/edit-recipient.dto'
import { RecipientAlreadyExistsError } from '@/domain/fast-feet/application/use-cases/errors/recipient-already-exists-error'

const editRecipientBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  address: z.string(),
  district: z.string(),
  city: z.string(),
  state: z.enum(StateArr),
  zipcode: z.string().length(8),
})

type EditRecipientBodySchema = z.infer<typeof editRecipientBodySchema>

const bodyValidationPipe = new ZodValidationPipe(editRecipientBodySchema)

@Controller('/recipients/:id')
@Roles(Role.Admin)
export class EditRecipientController {
  constructor(private readonly editRecipient: EditRecipientUseCase) {}

  @Put()
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: EditRecipientDto })
  async handle(
    @Param('id') id: string,
    @Body(bodyValidationPipe) body: EditRecipientBodySchema,
  ) {
    const { name, email, address, district, city, state, zipcode } = body

    const result = await this.editRecipient.execute({
      id,
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
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case RecipientAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
