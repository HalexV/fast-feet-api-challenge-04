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
import { WithdrawPackageUseCase } from '@/domain/fast-feet/application/use-cases/withdraw-package'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'

@Controller('/packages/:id/withdraw-package')
@Roles(Role.DeliveryPerson)
export class WithdrawPackageController {
  constructor(private readonly withdrawPackage: WithdrawPackageUseCase) {}

  @Patch()
  @ApiParam({ name: 'id', type: 'string' })
  async handle(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const deliveryPersonId = user.sub

    const result = await this.withdrawPackage.execute({
      id,
      deliveryPersonId,
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
