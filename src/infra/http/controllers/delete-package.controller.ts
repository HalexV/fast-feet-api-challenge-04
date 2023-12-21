import {
  BadRequestException,
  Controller,
  Delete,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'
import { Roles } from '@/infra/auth/roles.decorator'
import { Role } from '@/core/types/role.enum'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { DeletePackageUseCase } from '@/domain/fast-feet/application/use-cases/delete-package'

@Controller('/packages/:id')
@Roles(Role.Admin)
export class DeletePackageController {
  constructor(private readonly deletePackage: DeletePackageUseCase) {}

  @Delete()
  @ApiParam({ name: 'id', type: 'string' })
  async handle(@Param('id') id: string) {
    const result = await this.deletePackage.execute({
      id,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
