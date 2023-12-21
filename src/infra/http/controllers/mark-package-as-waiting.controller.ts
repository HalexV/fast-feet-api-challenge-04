import {
  BadRequestException,
  Controller,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'
import { Roles } from '@/infra/auth/roles.decorator'
import { Role } from '@/core/types/role.enum'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { MarkPackageAsWaitingUseCase } from '@/domain/fast-feet/application/use-cases/mark-package-as-waiting'
import { PackageStatusNotAllowedError } from '@/domain/fast-feet/application/use-cases/errors/package-status-not-allowed-error'

@Controller('/packages/:id/mark-as-waiting')
@Roles(Role.Admin)
export class MarkPackageAsWaitingController {
  constructor(
    private readonly markPackageAsWaiting: MarkPackageAsWaitingUseCase,
  ) {}

  @Patch()
  @ApiParam({ name: 'id', type: 'string' })
  async handle(@Param('id') id: string) {
    const result = await this.markPackageAsWaiting.execute({
      id,
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
