import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { ApiBody, ApiParam } from '@nestjs/swagger'
import { Roles } from '@/infra/auth/roles.decorator'
import { Role } from '@/core/types/role.enum'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { EditPackageUseCase } from '@/domain/fast-feet/application/use-cases/edit-package'
import { StatusArr } from '@/core/types/status'
import { EditPackageDto } from './dtos/edit-package.dto'
import { PackageStatusNotAllowedError } from '@/domain/fast-feet/application/use-cases/errors/package-status-not-allowed-error'

const editPackageBodySchema = z.object({
  description: z.string(),
  status: z.enum(StatusArr),
  postedAt: z.coerce.date(),
  withdrewAt: z.coerce.date().optional(),
  deliveredAt: z.coerce.date().optional(),
  deliveryPersonId: z.string().uuid().optional(),
  recipientId: z.string().uuid(),
})

type EditPackageBodySchema = z.infer<typeof editPackageBodySchema>

const bodyValidationPipe = new ZodValidationPipe(editPackageBodySchema)

@Controller('/packages/:id')
@Roles(Role.Admin)
export class EditPackageController {
  constructor(private readonly editPackage: EditPackageUseCase) {}

  @Put()
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: EditPackageDto })
  async handle(
    @Param('id') id: string,
    @Body(bodyValidationPipe) body: EditPackageBodySchema,
  ) {
    const {
      description,
      postedAt,
      recipientId,
      status,
      deliveredAt,
      deliveryPersonId,
      withdrewAt,
    } = body

    const result = await this.editPackage.execute({
      id,
      description,
      postedAt,
      recipientId,
      status,
      deliveredAt,
      deliveryPersonId,
      withdrewAt,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case PackageStatusNotAllowedError:
          throw new BadRequestException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
