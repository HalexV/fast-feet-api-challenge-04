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
import { PackageStatusNotAllowedError } from '@/domain/fast-feet/application/use-cases/errors/package-status-not-allowed-error'
import { ReturnPackageUseCase } from '@/domain/fast-feet/application/use-cases/return-package'

@Controller('/packages/:id/return-package')
@Roles(Role.Admin)
export class ReturnPackageController {
  constructor(private readonly returnPackage: ReturnPackageUseCase) {}

  @Patch()
  @ApiParam({ name: 'id', type: 'string' })
  async handle(@Param('id') id: string) {
    const result = await this.returnPackage.execute({
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
