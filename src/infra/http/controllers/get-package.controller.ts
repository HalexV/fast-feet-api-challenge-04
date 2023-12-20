import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { ApiOkResponse, ApiParam } from '@nestjs/swagger'
import { Roles } from '@/infra/auth/roles.decorator'
import { Role } from '@/core/types/role.enum'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { GetPackageUseCase } from '@/domain/fast-feet/application/use-cases/get-package'
import { GetPackageResponseModel } from './models/responses/get-package-response-model'
import { PackageWithRecipientPresenter } from '../presenters/package-with-recipient-presenter'

@Controller('/packages/:id')
@Roles(Role.Admin)
export class GetPackageController {
  constructor(private readonly getPackage: GetPackageUseCase) {}

  @Get()
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOkResponse({ type: GetPackageResponseModel })
  async handle(@Param('id') id: string) {
    const result = await this.getPackage.execute({
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

    return {
      package: PackageWithRecipientPresenter.toHTTP(result.value.pkg),
    }
  }
}
