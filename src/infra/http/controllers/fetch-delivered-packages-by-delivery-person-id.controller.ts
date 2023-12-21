import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import { ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger'
import { Roles } from '@/infra/auth/roles.decorator'
import { Role } from '@/core/types/role.enum'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { PackageWithRecipientPresenter } from '../presenters/package-with-recipient-presenter'
import { FetchDeliveredPackagesByDeliveryPersonIdUseCase } from '@/domain/fast-feet/application/use-cases/fetch-delivered-packages-by-delivery-person-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { FetchDeliveredPackagesByDeliveryPersonIdResponseModel } from './models/responses/fetch-delivered-packages-by-delivery-person-id-response-model'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/packages/delivered/:deliveryPersonId')
@Roles(Role.Admin, Role.DeliveryPerson)
export class FetchDeliveredPackagesByDeliveryPersonIdController {
  constructor(
    private readonly fetchDeliveredPackagesByDeliveryPersonId: FetchDeliveredPackagesByDeliveryPersonIdUseCase,
  ) {}

  @Get()
  @ApiParam({ name: 'deliveryPersonId', type: 'string' })
  @ApiQuery({ name: 'page', type: 'string' })
  @ApiOkResponse({
    type: FetchDeliveredPackagesByDeliveryPersonIdResponseModel,
  })
  async handle(
    @Param('deliveryPersonId') deliveryPersonId: string,
    @CurrentUser() user: UserPayload,
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
  ) {
    if (
      user.roles.includes(Role.DeliveryPerson) &&
      user.sub !== deliveryPersonId
    ) {
      throw new ForbiddenException('Not allowed')
    }

    const result = await this.fetchDeliveredPackagesByDeliveryPersonId.execute({
      page,
      deliveryPersonId,
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

    const pkgs = result.value.pkgs

    return {
      packages: pkgs.map(PackageWithRecipientPresenter.toHTTP),
    }
  }
}
